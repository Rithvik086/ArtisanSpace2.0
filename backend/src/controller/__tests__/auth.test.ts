/// <reference types="jest" />

import { signup, login, logout } from "../authController.js";
import type { Request, Response } from "express";
import * as userServices from "../../services/userServices.js";
import User from "../../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendMail } from "../../utils/emailSerice.js";

jest.mock("../../services/userServices");
jest.mock("../../models/userModel.js");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../utils/emailSerice");

describe("Auth - Critical Tests", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { body: {}, query: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };
    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
  });

  it("should signup user successfully", async () => {
    mockReq.body = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      name: "Test User",
      mobile_no: "1234567890",
      role: "customer",
    };

    (userServices.findUserByEmailOrUsername as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");
    (userServices.addUser as jest.Mock).mockResolvedValue(null);
    (userServices.findUserByEmail as jest.Mock).mockResolvedValue({ _id: "123" });
    (sendMail as jest.Mock).mockResolvedValue(null);

    await signup(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(201);
  });

  it("should reject duplicate username", async () => {
    mockReq.body = {
      username: "existing",
      email: "test@example.com",
      password: "password123",
      name: "Test",
      mobile_no: "1234567890",
      role: "customer",
    };

    (userServices.findUserByEmailOrUsername as jest.Mock).mockResolvedValue({
      username: "existing",
    });

    await signup(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it("should login with valid credentials", async () => {
    mockReq.body = { username: "testuser", password: "password123" };

    (userServices.findUserByUserName as jest.Mock).mockResolvedValue({
      _id: "user-123",
      password: "hashed",
      isVerified: true,
      role: "customer",
      name: "Test User",
      username: "testuser",
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("token");

    await login(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ token: "token" })
    );
  });

  it("should reject unverified email login", async () => {
    mockReq.body = { username: "testuser", password: "password123" };

    (userServices.findUserByUserName as jest.Mock).mockResolvedValue({
      _id: "user-123",
      password: "hashed",
      isVerified: false,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await login(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(403);
  });

  it("should logout user", () => {
    logout(mockReq as Request, mockRes as Response);

    expect(mockRes.clearCookie).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

