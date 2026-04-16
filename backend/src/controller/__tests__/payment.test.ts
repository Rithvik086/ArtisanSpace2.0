/// <reference types="jest" />

import { createPaymentOrder, handleWebhook } from "../paymentController.js";
import type { Request, Response } from "express";
import * as paymentServices from "../../services/paymentService.js";
import * as orderServices from "../../services/orderServices.js";
import crypto from "crypto";
import config from "../../config/index.js";

jest.mock("../../services/paymentService");
jest.mock("../../services/orderServices");

describe("Payment - Critical Tests", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      user: {
        id: "user-123",
        role: "customer",
        iat: Date.now(),
        exp: Date.now() + 86400,
      },
      body: {},
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it("should create payment order", async () => {
    (paymentServices.getAmount as jest.Mock).mockResolvedValue(1599);
    (paymentServices.createOrder as jest.Mock).mockResolvedValue({
      id: "order-123",
      amount: 159900,
      currency: "INR",
    });

    await createPaymentOrder(mockReq as Request, mockRes as Response);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: "order-123" })
    );
  });

  it("should reject empty cart", async () => {
    (paymentServices.getAmount as jest.Mock).mockResolvedValue(0);

    await createPaymentOrder(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it("should process successful payment webhook", async () => {
    const payload = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay-123",
            order_id: "order-123",
            amount: 159900,
            notes: { userId: "user-123" },
          },
        },
      },
    };

    mockReq.body = payload;
    const sig = crypto
      .createHmac("sha256", config.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(payload))
      .digest("hex");
    mockReq.headers = { "x-razorpay-signature": sig };

    (orderServices.placeUserOrder as jest.Mock).mockResolvedValue({});
    (paymentServices.savePayment as jest.Mock).mockResolvedValue(null);

    await handleWebhook(mockReq as Request, mockRes as Response);

    expect(mockRes.json).toHaveBeenCalledWith({ status: "ok" });
  });

  it("should reject invalid webhook signature", async () => {
    mockReq.body = { event: "payment.captured" };
    mockReq.headers = { "x-razorpay-signature": "invalid" };

    await handleWebhook(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
  });
});
