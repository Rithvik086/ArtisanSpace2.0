/// <reference types="jest" />

import { getCart, addToCart, editCart } from "../cartController.js";
import type { Request, Response } from "express";
import * as cartServices from "../../services/cartServices.js";

jest.mock("../../services/cartServices");

describe("Cart - Critical Tests", () => {
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
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it("should get user cart with total amount", async () => {
    const mockCart = [
      { productId: { newPrice: 500 }, quantity: 2 },
      { productId: { newPrice: 300 }, quantity: 1 },
    ];

    (cartServices.getUserCart as jest.Mock).mockResolvedValue(mockCart);

    await getCart(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, itemCount: 2 })
    );
  });

  it("should add item to cart", async () => {
    mockReq.body = { productId: "prod-123", quantity: 2 };

    (cartServices.addItem as jest.Mock).mockResolvedValue({
      success: true,
    });

    await addToCart(mockReq as Request, mockRes as Response);

    expect(cartServices.addItem).toHaveBeenCalledWith("user-123", "prod-123", 2);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it("should reject invalid quantity", async () => {
    mockReq.body = { productId: "prod-123", quantity: "invalid" };

    await addToCart(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it("should remove item from cart", async () => {
    mockReq.body = { productId: "prod-123", action: "rem" };

    (cartServices.removeCompleteItem as jest.Mock).mockResolvedValue({
      success: true,
    });

    await editCart(mockReq as Request, mockRes as Response);

    expect(mockRes.json).toHaveBeenCalled();
  });
});
