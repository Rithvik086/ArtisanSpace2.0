/// <reference types="jest" />

import type { Request, Response } from "express";
import { addToCart, editCart, getCart } from "../cartController.js";
import * as cartServices from "../../services/cartServices.js";

jest.mock("../../services/cartServices.js");

const createRes = (): Partial<Response> => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
});

describe("Cart Controller - Extended", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getCart", () => {
        it("computes amount and totalamount", async () => {
            const req = { user: { id: "u1", role: "customer", iat: 0, exp: 1 } } as unknown as Request;
            const res = createRes();
            (cartServices.getUserCart as jest.Mock).mockResolvedValue([
                { productId: { newPrice: 100 }, quantity: 2 },
                { productId: { newPrice: 50 }, quantity: 1 },
            ]);

            await getCart(req, res as Response);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    amount: 250,
                    totalamount: 250 + (5 / 100) * 250 + (18 / 100) * 250,
                    itemCount: 2,
                }),
            );
        });

        it("returns 500 when service throws", async () => {
            const req = { user: { id: "u1", role: "customer", iat: 0, exp: 1 } } as unknown as Request;
            const res = createRes();
            (cartServices.getUserCart as jest.Mock).mockRejectedValue(new Error("db fail"));

            await getCart(req, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe("addToCart", () => {
        it.each([
            [{ user: { id: "u1" }, body: { quantity: 1 } }, 400],
            [{ user: { id: "u1" }, body: { productId: "p1", quantity: -1 } }, 400],
            [{ user: { id: "u1" }, body: { productId: "p1", quantity: "abc" } }, 400],
        ])("validates payload %#", async (reqObj, status) => {
            const req = reqObj as unknown as Request;
            const res = createRes();

            await addToCart(req, res as Response);

            expect(res.status).toHaveBeenCalledWith(status);
        });

        it.each([
            [{ productId: "p1" }, 1],
            [{ productId: "p1", quantity: 2 }, 2],
            [{ productId: "p1", quantity: "3" }, 3],
            [{ productId: "p1", quantity: "01" }, 1],
            [{ productId: "p1", quantity: 0 }, 1],
        ])("adds item with normalized quantity %#", async (body, quantity) => {
            const req = {
                user: { id: "u1", role: "customer", iat: 0, exp: 1 },
                body,
            } as unknown as Request;
            const res = createRes();
            (cartServices.addItem as jest.Mock).mockResolvedValue({ success: true });

            await addToCart(req, res as Response);

            expect(cartServices.addItem).toHaveBeenCalledWith("u1", "p1", quantity);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("returns 500 when add service fails", async () => {
            const req = {
                user: { id: "u1", role: "customer", iat: 0, exp: 1 },
                body: { productId: "p1", quantity: 2 },
            } as unknown as Request;
            const res = createRes();
            (cartServices.addItem as jest.Mock).mockRejectedValue(new Error("write fail"));

            await addToCart(req, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe("editCart", () => {
        const reqBase = {
            user: { id: "u1", role: "customer", iat: 0, exp: 1 },
            body: { productId: "p1" },
        };

        it.each([
            [{ user: { id: "u1" }, body: { action: "add" } }, "userId, productId, and action are required"],
            [{ user: { id: "u1" }, body: { productId: "p1" } }, "userId, productId, and action are required"],
        ])("validates required fields %#", async (reqObj, message) => {
            const req = reqObj as unknown as Request;
            const res = createRes();

            await editCart(req, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message }));
        });

        it.each([
            ["add", "addItem"],
            ["del", "deleteItem"],
            ["rem", "removeCompleteItem"],
        ])("routes action %s to the proper service", async (action, serviceName) => {
            const req = {
                ...reqBase,
                body: { productId: "p1", action },
            } as unknown as Request;
            const res = createRes();
            (cartServices as any)[serviceName].mockResolvedValue({ success: true, action });

            await editCart(req, res as Response);

            expect((cartServices as any)[serviceName]).toHaveBeenCalledWith("u1", "p1");
            expect(res.json).toHaveBeenCalledWith({ success: true, action });
        });

        it.each([
            [undefined, 400, "amount is required for 'none' action"],
            ["abc", 400, "amount must be a valid number"],
            ["5", 200, null],
            ["0", 200, null],
        ])("handles none action with amount %#", async (amount, status, errMsg) => {
            const req = {
                ...reqBase,
                body: { productId: "p1", action: "none", amount },
            } as unknown as Request;
            const res = createRes();
            (cartServices.changeProductAmount as jest.Mock).mockResolvedValue({ success: true, amount });

            await editCart(req, res as Response);

            if (status === 200) {
                expect(cartServices.changeProductAmount).toHaveBeenCalledWith("u1", "p1", parseInt(amount as string));
                expect(res.json).toHaveBeenCalledWith({ success: true, amount });
            } else {
                expect(res.status).toHaveBeenCalledWith(status);
                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: errMsg }));
            }
        });

        it("rejects invalid action", async () => {
            const req = {
                ...reqBase,
                body: { productId: "p1", action: "invalid" },
            } as unknown as Request;
            const res = createRes();

            await editCart(req, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it.each([
            ["addItem", "add"],
            ["deleteItem", "del"],
            ["removeCompleteItem", "rem"],
            ["changeProductAmount", "none"],
        ])("returns 500 when %s throws", async (serviceName, action) => {
            const req = {
                ...reqBase,
                body: { productId: "p1", action, amount: "2" },
            } as unknown as Request;
            const res = createRes();
            (cartServices as any)[serviceName].mockRejectedValue(new Error("failure"));

            await editCart(req, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
