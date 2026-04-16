/// <reference types="jest" />

import { getOrderById, placeOrder } from "../orderController.js";
import type { Request, Response } from "express";
import * as orderServices from "../../services/orderServices.js";

jest.mock("../../services/orderServices");

describe("Order - Critical Tests", () => {
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
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it("should fetch order by ID", async () => {
    mockReq.params = { orderId: "order-123" };

    (orderServices.getOrderByOrderId as jest.Mock).mockResolvedValue({
      _id: "order-123",
      totalAmount: 1599,
      status: "pending",
    });

    await getOrderById(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  it("should return 404 if order not found", async () => {
    mockReq.params = { orderId: "nonexistent" };

    (orderServices.getOrderByOrderId as jest.Mock).mockResolvedValue(null);

    await getOrderById(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  it("should place COD order successfully", async () => {
    mockReq.body = { paymentMethod: "cod" };

    (orderServices.placeUserOrder as jest.Mock).mockResolvedValue({
      success: true,
      orderId: "order-123",
    });

    await placeOrder(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(201);
  });

  it("should reject insufficient stock", async () => {
    mockReq.body = { paymentMethod: "cod" };

    (orderServices.placeUserOrder as jest.Mock).mockRejectedValue(
      new Error("Insufficient stock for product: Vase")
    );

    await placeOrder(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
  });
});
