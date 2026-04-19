/// <reference types="jest" />

import type { Request, Response } from "express";
import crypto from "crypto";
import config from "../../config/index.js";
import { createPaymentOrder, handleWebhook } from "../paymentController.js";
import * as paymentServices from "../../services/paymentService.js";
import * as orderServices from "../../services/orderServices.js";

jest.mock("../../services/paymentService.js");
jest.mock("../../services/orderServices.js");

const createRes = (): Partial<Response> => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
});

const signPayload = (payload: unknown) =>
    crypto
        .createHmac("sha256", config.RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest("hex");

describe("Payment Controller - Extended", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createPaymentOrder", () => {
        it("rejects unauthenticated users", async () => {
            const req = { user: undefined } as unknown as Request;
            const res = createRes();

            await createPaymentOrder(req, res as Response);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        it.each([0, -1])("rejects non-positive amount %s", async (amount) => {
            const req = { user: { id: "u1", role: "customer", iat: 0, exp: 1 } } as unknown as Request;
            const res = createRes();
            (paymentServices.getAmount as jest.Mock).mockResolvedValue(amount);

            await createPaymentOrder(req, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("returns order details on success", async () => {
            const req = { user: { id: "u1", role: "customer", iat: 0, exp: 1 } } as unknown as Request;
            const res = createRes();
            (paymentServices.getAmount as jest.Mock).mockResolvedValue(200);
            (paymentServices.createOrder as jest.Mock).mockResolvedValue({
                id: "ord_123",
                amount: 20000,
                currency: "INR",
            });

            await createPaymentOrder(req, res as Response);

            expect(paymentServices.createOrder).toHaveBeenCalledWith(200, "u1");
            expect(res.json).toHaveBeenCalledWith({ orderId: "ord_123", amount: 20000, currency: "INR" });
        });

        it.each([
            [new Error("amount failed")],
            [new Error("gateway down")],
        ])("returns 500 when any step fails %#", async (error) => {
            const req = { user: { id: "u1", role: "customer", iat: 0, exp: 1 } } as unknown as Request;
            const res = createRes();
            (paymentServices.getAmount as jest.Mock).mockRejectedValue(error);

            await createPaymentOrder(req, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
        });
    });

    describe("handleWebhook", () => {
        it("rejects invalid signature", async () => {
            const req = {
                headers: { "x-razorpay-signature": "invalid" },
                body: { event: "payment.captured", payload: { payment: { entity: { notes: {} } } } },
            } as unknown as Request;
            const res = createRes();

            await handleWebhook(req, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("handles payment.captured event", async () => {
            const payload = {
                event: "payment.captured",
                payload: {
                    payment: {
                        entity: {
                            id: "pay_1",
                            order_id: "order_1",
                            amount: 19900,
                            notes: { userId: "u1" },
                        },
                    },
                },
            };
            const req = {
                body: payload,
                headers: { "x-razorpay-signature": signPayload(payload) },
            } as unknown as Request;
            const res = createRes();
            (orderServices.placeUserOrder as jest.Mock).mockResolvedValue({ success: true });
            (paymentServices.savePayment as jest.Mock).mockResolvedValue({ success: true });

            await handleWebhook(req, res as Response);

            expect(orderServices.placeUserOrder).toHaveBeenCalledWith("u1", "pay_1");
            expect(paymentServices.savePayment).toHaveBeenCalledWith("u1", "order_1", "pay_1", 199, "success");
            expect(res.json).toHaveBeenCalledWith({ status: "ok" });
        });

        it("handles payment.failed event", async () => {
            const payload = {
                event: "payment.failed",
                payload: {
                    payment: {
                        entity: {
                            id: "pay_2",
                            order_id: "order_2",
                            amount: 8900,
                            notes: { userId: "u2" },
                        },
                    },
                },
            };
            const req = {
                body: payload,
                headers: { "x-razorpay-signature": signPayload(payload) },
            } as unknown as Request;
            const res = createRes();
            (paymentServices.savePayment as jest.Mock).mockResolvedValue({ success: true });

            await handleWebhook(req, res as Response);

            expect(paymentServices.savePayment).toHaveBeenCalledWith("u2", "order_2", "pay_2", 89, "failed");
            expect(res.json).toHaveBeenCalledWith({ status: "ok" });
        });

        it.each([
            ["payment.authorized"],
            ["order.paid"],
            ["subscription.cancelled"],
        ])("ignores unsupported event %s", async (eventName) => {
            const payload = {
                event: eventName,
                payload: {
                    payment: {
                        entity: {
                            id: "pay_x",
                            order_id: "order_x",
                            amount: 1000,
                            notes: { userId: "ux" },
                        },
                    },
                },
            };
            const req = {
                body: payload,
                headers: { "x-razorpay-signature": signPayload(payload) },
            } as unknown as Request;
            const res = createRes();

            await handleWebhook(req, res as Response);

            expect(orderServices.placeUserOrder).not.toHaveBeenCalled();
            expect(paymentServices.savePayment).not.toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ status: "ok" });
        });

        it.each([
            [new Error("bad payload")],
            [new Error("db error")],
        ])("returns 500 for internal webhook errors %#", async (err) => {
            const payload = {
                event: "payment.captured",
                payload: {
                    payment: {
                        entity: {
                            id: "pay_3",
                            order_id: "order_3",
                            amount: 5000,
                            notes: { userId: "u3" },
                        },
                    },
                },
            };
            const req = {
                body: payload,
                headers: { "x-razorpay-signature": signPayload(payload) },
            } as unknown as Request;
            const res = createRes();
            (orderServices.placeUserOrder as jest.Mock).mockRejectedValue(err);

            await handleWebhook(req, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Webhook processing failed" });
        });
    });
});
