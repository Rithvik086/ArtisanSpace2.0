/// <reference types="jest" />

import type { Request, Response } from "express";
import {
    changeStatus,
    deleteOrder,
    getOrderById,
    getUserOrders,
    placeOrder,
} from "../orderController.js";
import * as orderServices from "../../services/orderServices.js";

jest.mock("../../services/orderServices.js");

const createRes = (): Partial<Response> => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
});

describe("Order Controller - Extended", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getOrderById", () => {
        it("returns 400 when order id missing", async () => {
            const req = { params: {} } as Partial<Request>;
            const res = createRes();

            await getOrderById(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("returns 404 when order does not exist", async () => {
            const req = { params: { orderId: "o1" } } as Partial<Request>;
            const res = createRes();
            (orderServices.getOrderByOrderId as jest.Mock).mockResolvedValue(null);

            await getOrderById(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it("returns 200 with order", async () => {
            const req = { params: { orderId: "o1" } } as Partial<Request>;
            const res = createRes();
            (orderServices.getOrderByOrderId as jest.Mock).mockResolvedValue({ _id: "o1" });

            await getOrderById(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        it("returns 500 when service throws", async () => {
            const req = { params: { orderId: "o1" } } as Partial<Request>;
            const res = createRes();
            (orderServices.getOrderByOrderId as jest.Mock).mockRejectedValue(new Error("boom"));

            await getOrderById(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe("getUserOrders", () => {
        it.each([
            [[{ _id: "o1" }], 200],
            [[], 200],
        ])("returns orders list %#", async (orders, status) => {
            const req = { user: { id: "u1", role: "customer", iat: 0, exp: 1 } } as unknown as Request;
            const res = createRes();
            (orderServices.getOrdersByUserId as jest.Mock).mockResolvedValue(orders);

            await getUserOrders(req, res as Response);

            expect(orderServices.getOrdersByUserId).toHaveBeenCalledWith("u1");
            expect(res.status).toHaveBeenCalledWith(status);
        });

        it("returns 500 when get user orders fails", async () => {
            const req = { user: { id: "u1", role: "customer", iat: 0, exp: 1 } } as unknown as Request;
            const res = createRes();
            (orderServices.getOrdersByUserId as jest.Mock).mockRejectedValue(new Error("boom"));

            await getUserOrders(req, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe("placeOrder", () => {
        const reqBase = { user: { id: "u1", role: "customer", iat: 0, exp: 1 } } as unknown as Request;

        it.each([
            [{ paymentMethod: "online" }, 403],
            [{ paymentMethod: "UPI" }, 403],
            [{ paymentMethod: "card" }, 403],
        ])("rejects non-cod payment method %#", async (body, status) => {
            const req = { ...reqBase, body } as Request;
            const res = createRes();

            await placeOrder(req, res as Response);

            expect(res.status).toHaveBeenCalledWith(status);
        });

        it.each([
            [{ paymentMethod: "cod" }, { success: true, orderId: "o1" }, 201],
            [{}, { success: true, orderId: "o1" }, 201],
            [{ paymentMethod: "COD" }, { success: true, orderId: "o1" }, 201],
            [{ paymentMethod: "cod" }, { success: false, message: "No stock" }, 400],
            [{ paymentMethod: "cod" }, { success: false }, 400],
        ])("handles cod flow %#", async (body, serviceResult, status) => {
            const req = { ...reqBase, body } as Request;
            const res = createRes();
            (orderServices.placeUserOrder as jest.Mock).mockResolvedValue(serviceResult);

            await placeOrder(req, res as Response);

            expect(orderServices.placeUserOrder).toHaveBeenCalledWith("u1");
            expect(res.status).toHaveBeenCalledWith(status);
        });

        it("returns 500 when place user order throws", async () => {
            const req = { ...reqBase, body: { paymentMethod: "cod" } } as Request;
            const res = createRes();
            (orderServices.placeUserOrder as jest.Mock).mockRejectedValue(new Error("fatal"));

            await placeOrder(req, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "fatal" }));
        });
    });

    describe("changeStatus", () => {
        it.each([
            [{ success: true }, 200],
            [{ success: false, message: "invalid state" }, 400],
            [{ success: false }, 400],
        ])("maps response %#", async (serviceResult, status) => {
            const req = {
                params: { orderId: "o1" },
                body: { status: "shipped" },
            } as Partial<Request>;
            const res = createRes();
            (orderServices.changeOrderStatus as jest.Mock).mockResolvedValue(serviceResult);

            await changeStatus(req as Request, res as Response);

            expect(orderServices.changeOrderStatus).toHaveBeenCalledWith("o1", "shipped");
            expect(res.status).toHaveBeenCalledWith(status);
        });

        it("returns 500 when update status crashes", async () => {
            const req = {
                params: { orderId: "o1" },
                body: { status: "shipped" },
            } as Partial<Request>;
            const res = createRes();
            (orderServices.changeOrderStatus as jest.Mock).mockRejectedValue(new Error("db fail"));

            await changeStatus(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe("deleteOrder", () => {
        it.each([
            [{ success: true }, 200],
            [{ success: false, message: "not found" }, 400],
            [{ success: false }, 400],
        ])("maps delete response %#", async (serviceResult, status) => {
            const req = { params: { orderId: "o1" } } as Partial<Request>;
            const res = createRes();
            (orderServices.deleteOrderById as jest.Mock).mockResolvedValue(serviceResult);

            await deleteOrder(req as Request, res as Response);

            expect(orderServices.deleteOrderById).toHaveBeenCalledWith("o1");
            expect(res.status).toHaveBeenCalledWith(status);
        });

        it("returns 500 when delete crashes", async () => {
            const req = { params: { orderId: "o1" } } as Partial<Request>;
            const res = createRes();
            (orderServices.deleteOrderById as jest.Mock).mockRejectedValue(new Error("db fail"));

            await deleteOrder(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
