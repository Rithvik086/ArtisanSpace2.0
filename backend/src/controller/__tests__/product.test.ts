/// <reference types="jest" />

import { getProducts } from "../productController.js";
import type { Request, Response } from "express";
import * as productServices from "../../services/productServices.js";

jest.mock("../../services/productServices");

describe("Product - Critical Tests", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { query: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it("should fetch approved products", async () => {
    const mockProducts = [
      { _id: "1", name: "Vase", newPrice: 500 },
      { _id: "2", name: "Pot", newPrice: 300 },
    ];

    (productServices.getApprovedProducts as jest.Mock).mockResolvedValue({
      products: mockProducts,
      pagination: { page: 1, limit: 12, total: 2 },
    });

    await getProducts(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, products: mockProducts })
    );
  });

  it("should filter by category", async () => {
    mockReq.query = { category: "home" };

    (productServices.getApprovedProducts as jest.Mock).mockResolvedValue({
      products: [],
      pagination: { page: 1, limit: 12, total: 0 },
    });

    await getProducts(mockReq as Request, mockRes as Response);

    expect(productServices.getApprovedProducts).toHaveBeenCalledWith(
      ["home"],
      null,
      1,
      12,
      null
    );
  });

  it("should search by name", async () => {
    mockReq.query = { search: "vase" };

    (productServices.getApprovedProducts as jest.Mock).mockResolvedValue({
      products: [],
      pagination: { page: 1, limit: 12, total: 0 },
    });

    await getProducts(mockReq as Request, mockRes as Response);

    expect(productServices.getApprovedProducts).toHaveBeenCalledWith(
      null,
      null,
      1,
      12,
      "vase"
    );
  });
});
