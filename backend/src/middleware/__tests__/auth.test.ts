/// <reference types="jest" />

import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../../config/index.js";

jest.mock("jsonwebtoken");

describe("Auth Middleware - Critical Tests", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { cookies: {}, headers: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it("should verify valid JWT token", () => {
    const tokenData = {
      id: "user-123",
      role: "customer",
    };

    (jwt.verify as jest.Mock).mockReturnValue(tokenData);

    const verified = jwt.verify("valid.token", config.JWT_SECRET) as any;

    expect(verified.id).toBe("user-123");
    expect(verified.role).toBe("customer");
  });

  it("should reject invalid token signature", () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new jwt.JsonWebTokenError("invalid signature");
    });

    expect(() => {
      jwt.verify("invalid.token", config.JWT_SECRET);
    }).toThrow();
  });

  it("should reject expired token", () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new jwt.TokenExpiredError("jwt expired", new Date());
    });

    expect(() => {
      jwt.verify("expired.token", config.JWT_SECRET);
    }).toThrow();
  });
});
