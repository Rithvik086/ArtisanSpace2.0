/// <reference types="jest" />

import { signup, login, logout, verifyEmail, forgotPassword, resetPassword } from "../authController.js";
import type { Request, Response } from "express";
import * as userServices from "../../services/userServices.js";
import User from "../../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendMail } from "../../utils/emailSerice.js";

jest.mock("../../services/userServices");
jest.mock("../../models/userModel");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../utils/emailSerice");

describe("Authentication Controller", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;

    beforeEach(() => {
        jest.clearAllMocks();

        mockReq = {
            body: {},
            query: {},
            user: {
                id: "user-123",
                role: "customer",
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 86400
            },
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            cookie: jest.fn().mockReturnThis(),
            clearCookie: jest.fn().mockReturnThis(),
            redirect: jest.fn(),
        };
    });

    describe("signup", () => {
        it("should signup a new user successfully", async () => {
            const userData = {
                username: "testuser",
                name: "Test User",
                email: "test@example.com",
                password: "password123",
                mobile_no: "1234567890",
                role: "customer",
            };

            mockReq.body = userData;

            (userServices.findUserByEmailOrUsername as jest.Mock).mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
            (userServices.addUser as jest.Mock).mockResolvedValue(null);
            (userServices.findUserByEmail as jest.Mock).mockResolvedValue({
                _id: "123",
                email: userData.email,
            });
            (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
            (sendMail as jest.Mock).mockResolvedValue(null);

            await signup(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: "User registered successfully.",
            });
        });

        it("should reject if username already exists", async () => {
            mockReq.body = {
                username: "existinguser",
                name: "Test User",
                email: "test@example.com",
                password: "password123",
                mobile_no: "1234567890",
                role: "customer",
            };

            (userServices.findUserByEmailOrUsername as jest.Mock).mockResolvedValue({
                username: "existinguser",
            });

            await signup(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: "Username or email already exists.",
            });
        });

        it("should reject invalid email format", async () => {
            mockReq.body = {
                username: "testuser",
                name: "Test User",
                email: "invalid-email",
                password: "password123",
                mobile_no: "1234567890",
                role: "customer",
            };

            await signup(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it("should reject password less than 8 characters", async () => {
            mockReq.body = {
                username: "testuser",
                name: "Test User",
                email: "test@example.com",
                password: "short",
                mobile_no: "1234567890",
                role: "customer",
            };

            await signup(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(400);
        });
    });

    describe("login", () => {
        it("should login user with valid credentials", async () => {
            mockReq.body = {
                username: "testuser",
                password: "password123",
            };

            const mockUser = {
                _id: "user-123",
                password: "hashed_password",
                isVerified: true,
                role: "customer",
                name: "Test User",
                username: "testuser",
            };

            (userServices.findUserByUserName as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue("jwt-token");

            await login(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.cookie).toHaveBeenCalledWith("token", "jwt-token", expect.any(Object));
            expect(mockRes.json).toHaveBeenCalledWith({
                message: "Login successful",
                token: "jwt-token",
                user: expect.objectContaining({
                    id: "user-123",
                    role: "customer",
                }),
            });
        });

        it("should reject login with invalid username", async () => {
            mockReq.body = {
                username: "nonexistent",
                password: "password123",
            };

            (userServices.findUserByUserName as jest.Mock).mockResolvedValue(null);

            await login(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: "Invalid username or password",
            });
        });

        it("should reject login with wrong password", async () => {
            mockReq.body = {
                username: "testuser",
                password: "wrongpassword",
            };

            const mockUser = {
                _id: "user-123",
                password: "hashed_password",
                isVerified: true,
                role: "customer",
            };

            (userServices.findUserByUserName as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await login(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: "Invalid username or password",
            });
        });

        it("should reject login if email not verified", async () => {
            mockReq.body = {
                username: "testuser",
                password: "password123",
            };

            const mockUser = {
                _id: "user-123",
                password: "hashed_password",
                isVerified: false,
                role: "customer",
            };

            (userServices.findUserByUserName as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            await login(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: "Please verify your email before logging in.",
            });
        });
    });

    describe("logout", () => {
        it("should clear token and logout user", () => {
            logout(mockReq as Request, mockRes as Response);

            expect(mockRes.clearCookie).toHaveBeenCalledWith("token", {
                httpOnly: true,
                sameSite: "strict",
            });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: "Logged out successfully",
            });
        });
    });

    describe("verifyEmail", () => {
        it("should verify email with valid token", async () => {
            mockReq.query = { token: "valid-token" };

            const mockUser = {
                _id: "user-123",
                verificationToken: "valid-token",
                tokenExpiresAt: new Date(Date.now() + 10000),
            };

            (User.findOne as jest.Mock).mockResolvedValue(mockUser);
            (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

            await verifyEmail(mockReq as Request, mockRes as Response);

            expect(User.findByIdAndUpdate).toHaveBeenCalled();
            expect(mockRes.redirect).toHaveBeenCalled();
        });

        it("should reject with invalid token", async () => {
            mockReq.query = { token: "invalid-token" };

            (User.findOne as jest.Mock).mockResolvedValue(null);

            await verifyEmail(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: "Invalid or expired verification token",
            });
        });

        it("should reject with expired token", async () => {
            mockReq.query = { token: "expired-token" };

            const mockUser = {
                _id: "user-123",
                verificationToken: "expired-token",
                tokenExpiresAt: new Date(Date.now() - 10000),
            };

            (User.findOne as jest.Mock).mockResolvedValue(mockUser);

            await verifyEmail(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: "Verification token has expired",
            });
        });
    });

    describe("forgotPassword", () => {
        it("should send reset link for valid email", async () => {
            mockReq.body = { email: "test@example.com" };

            const mockUser = {
                _id: "user-123",
                email: "test@example.com",
                name: "Test User",
            };

            (userServices.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
            (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
            (sendMail as jest.Mock).mockResolvedValue(null);

            await forgotPassword(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: "Password reset link sent to your email.",
            });
        });

        it("should return 404 if user not found", async () => {
            mockReq.body = { email: "nonexistent@example.com" };

            (userServices.findUserByEmail as jest.Mock).mockResolvedValue(null);

            await forgotPassword(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: "User not found",
            });
        });

        it("should reject invalid email format", async () => {
            mockReq.body = { email: "invalid-email" };

            await forgotPassword(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(400);
        });
    });

    describe("resetPassword", () => {
        it("should reset password with valid token", async () => {
            mockReq.body = {
                token: "valid-reset-token",
                newPassword: "newpassword123",
            };

            const mockUser = {
                _id: "user-123",
                resetToken: "valid-reset-token",
                resetTokenExpiresAt: new Date(Date.now() + 10000),
            };

            (User.findOne as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
            (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

            await resetPassword(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: "Password reset successfully. You can now log in with your new password.",
            });
        });

        it("should reject with invalid token", async () => {
            mockReq.body = {
                token: "invalid-token",
                newPassword: "newpassword123",
            };

            (User.findOne as jest.Mock).mockResolvedValue(null);

            await resetPassword(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: "Invalid or expired reset token",
            });
        });

        it("should reject with expired token", async () => {
            mockReq.body = {
                token: "expired-token",
                newPassword: "newpassword123",
            };

            const mockUser = {
                _id: "user-123",
                resetToken: "expired-token",
                resetTokenExpiresAt: new Date(Date.now() - 10000),
            };

            (User.findOne as jest.Mock).mockResolvedValue(mockUser);

            await resetPassword(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: "Reset token has expired",
            });
        });
    });
});