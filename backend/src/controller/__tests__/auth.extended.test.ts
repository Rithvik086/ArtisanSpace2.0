/// <reference types="jest" />

import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/userModel.js";
import {
    addUserHandler,
    checkEmail,
    checkUsername,
    deleteAccount,
    deleteUser,
    forgotPassword,
    login,
    me,
    resetPassword,
    signup,
    updatProfile,
    verifyEmail,
} from "../authController.js";
import * as userServices from "../../services/userServices.js";
import { sendMail } from "../../utils/emailSerice.js";

jest.mock("../../services/userServices.js");
jest.mock("../../models/userModel.js");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../utils/emailSerice.js");

const createRes = (): Partial<Response> => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
});

describe("Auth Controller - Extended", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("signup", () => {
        it.each([
            [{}, 400],
            [{ username: "x", email: "a@a.com", password: "pass12345", mobile_no: "1234567890", role: "customer", name: "John" }, 400],
            [{ username: "valid_user", email: "bad-email", password: "pass12345", mobile_no: "1234567890", role: "customer", name: "John Doe" }, 400],
            [{ username: "valid_user", email: "a@a.com", password: "123", mobile_no: "1234567890", role: "customer", name: "John Doe" }, 400],
            [{ username: "valid_user", email: "a@a.com", password: "pass12345", mobile_no: "123", role: "customer", name: "John Doe" }, 400],
            [{ username: "valid_user", email: "a@a.com", password: "pass12345", mobile_no: "1234567890", role: "admin", name: "John Doe" }, 400],
        ])("validates payload %#", async (body, status) => {
            const req = { body } as Partial<Request>;
            const res = createRes();

            await signup(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(status);
        });

        it("rejects duplicate username/email", async () => {
            const req = {
                body: {
                    username: "valid_user",
                    name: "John Doe",
                    email: "a@a.com",
                    password: "pass12345",
                    mobile_no: "1234567890",
                    role: "customer",
                },
            } as Partial<Request>;
            const res = createRes();
            (userServices.findUserByEmailOrUsername as jest.Mock).mockResolvedValue({ _id: "u1" });

            await signup(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("creates user and sends verification email", async () => {
            const req = {
                body: {
                    username: "valid_user",
                    name: "John Doe",
                    email: "a@a.com",
                    password: "pass12345",
                    mobile_no: "1234567890",
                    role: "customer",
                },
            } as Partial<Request>;
            const res = createRes();
            (userServices.findUserByEmailOrUsername as jest.Mock).mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");
            (userServices.addUser as jest.Mock).mockResolvedValue({ success: true });
            (userServices.findUserByEmail as jest.Mock).mockResolvedValue({ _id: "u1" });
            (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({});
            (sendMail as jest.Mock).mockResolvedValue({});

            await signup(req as Request, res as Response);

            expect(userServices.addUser).toHaveBeenCalled();
            expect(sendMail).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe("login", () => {
        it.each([
            [{}, 400],
            [{ username: "u1" }, 400],
            [{ password: "p1" }, 400],
        ])("validates input %#", async (body, status) => {
            const req = { body } as Partial<Request>;
            const res = createRes();

            await login(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(status);
        });

        it("returns 401 when user not found", async () => {
            const req = { body: { username: "u1", password: "p1" } } as Partial<Request>;
            const res = createRes();
            (userServices.findUserByUserName as jest.Mock).mockResolvedValue(null);

            await login(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        it("returns 401 for password mismatch", async () => {
            const req = { body: { username: "u1", password: "p1" } } as Partial<Request>;
            const res = createRes();
            (userServices.findUserByUserName as jest.Mock).mockResolvedValue({ password: "hashed", isVerified: true });
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await login(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        it("returns 403 for unverified user", async () => {
            const req = { body: { username: "u1", password: "p1" } } as Partial<Request>;
            const res = createRes();
            (userServices.findUserByUserName as jest.Mock).mockResolvedValue({ password: "hashed", isVerified: false });
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            await login(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(403);
        });

        it("sets cookie and token for valid user", async () => {
            const req = { body: { username: "u1", password: "p1" } } as Partial<Request>;
            const res = createRes();
            (userServices.findUserByUserName as jest.Mock).mockResolvedValue({
                _id: "u1",
                password: "hashed",
                isVerified: true,
                role: "customer",
                name: "John",
                username: "u1",
            });
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue("token_123");

            await login(req as Request, res as Response);

            expect(res.cookie).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: "token_123" }));
        });
    });

    describe("verifyEmail", () => {
        it("validates missing token", async () => {
            const req = { query: {} } as Partial<Request>;
            const res = createRes();

            await verifyEmail(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("returns 400 for invalid token", async () => {
            const req = { query: { token: "abc" } } as Partial<Request>;
            const res = createRes();
            (User.findOne as jest.Mock).mockResolvedValue(null);

            await verifyEmail(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("returns 400 for expired token", async () => {
            const req = { query: { token: "abc" } } as Partial<Request>;
            const res = createRes();
            (User.findOne as jest.Mock).mockResolvedValue({ _id: "u1", tokenExpiresAt: new Date(Date.now() - 1000) });

            await verifyEmail(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("redirects on successful verification", async () => {
            const req = { query: { token: "abc" } } as Partial<Request>;
            const res = createRes();
            (User.findOne as jest.Mock).mockResolvedValue({ _id: "u1", tokenExpiresAt: new Date(Date.now() + 10000) });
            (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

            await verifyEmail(req as Request, res as Response);

            expect(res.redirect).toHaveBeenCalled();
        });
    });

    describe("forgotPassword", () => {
        it.each([
            [{}, 400],
            [{ email: "bad" }, 400],
        ])("validates forgot-password payload %#", async (body, status) => {
            const req = { body } as Partial<Request>;
            const res = createRes();

            await forgotPassword(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(status);
        });

        it("returns 404 for missing user", async () => {
            const req = { body: { email: "a@a.com" } } as Partial<Request>;
            const res = createRes();
            (userServices.findUserByEmail as jest.Mock).mockResolvedValue(null);

            await forgotPassword(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it("returns 200 when mail sent", async () => {
            const req = { body: { email: "a@a.com" } } as Partial<Request>;
            const res = createRes();
            (userServices.findUserByEmail as jest.Mock).mockResolvedValue({ _id: "u1", name: "John" });
            (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({});
            (sendMail as jest.Mock).mockResolvedValue({});

            await forgotPassword(req as Request, res as Response);

            expect(sendMail).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe("resetPassword", () => {
        it.each([
            [{}, 400],
            [{ token: "", newPassword: "123456" }, 400],
            [{ token: "abc", newPassword: "123" }, 400],
        ])("validates payload %#", async (body, status) => {
            const req = { body } as Partial<Request>;
            const res = createRes();

            await resetPassword(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(status);
        });

        it("returns 400 when reset token invalid", async () => {
            const req = { body: { token: "abc", newPassword: "123456" } } as Partial<Request>;
            const res = createRes();
            (User.findOne as jest.Mock).mockResolvedValue(null);

            await resetPassword(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("returns 400 when token expired", async () => {
            const req = { body: { token: "abc", newPassword: "123456" } } as Partial<Request>;
            const res = createRes();
            (User.findOne as jest.Mock).mockResolvedValue({ _id: "u1", resetTokenExpiresAt: new Date(Date.now() - 1000) });

            await resetPassword(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("resets password for valid token", async () => {
            const req = { body: { token: "abc", newPassword: "123456" } } as Partial<Request>;
            const res = createRes();
            (User.findOne as jest.Mock).mockResolvedValue({ _id: "u1", resetTokenExpiresAt: new Date(Date.now() + 1000) });
            (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");
            (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

            await resetPassword(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe("profile and account", () => {
        it.each([
            [{ name: "x" }, 400],
            [{ name: "John1" }, 400],
        ])("validates profile update %#", async (body, status) => {
            const req = { body, user: { id: "u1", role: "customer", iat: 0, exp: 1 } } as unknown as Request;
            const res = createRes();

            await updatProfile(req, res as Response);

            expect(res.status).toHaveBeenCalledWith(status);
        });

        it("allows empty profile payload when service succeeds", async () => {
            const req = { body: {}, user: { id: "u1", role: "customer", iat: 0, exp: 1 } } as unknown as Request;
            const res = createRes();
            (userServices.updateUser as jest.Mock).mockResolvedValue({ success: true });

            await updatProfile(req, res as Response);

            expect(userServices.updateUser).toHaveBeenCalledWith("u1", undefined, undefined, undefined);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("updates profile successfully", async () => {
            const req = {
                body: {
                    name: " John Doe ",
                    mobile_no: " 1234567890 ",
                    address: {
                        city: " New York ",
                        country: " USA ",
                    },
                },
                user: { id: "u1", role: "customer", iat: 0, exp: 1 },
            } as unknown as Request;
            const res = createRes();
            (userServices.updateUser as jest.Mock).mockResolvedValue({ success: true });

            await updatProfile(req, res as Response);

            expect(userServices.updateUser).toHaveBeenCalledWith("u1", "john doe", "1234567890", {
                city: "new york",
                country: "usa",
            });
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it.each([
            [{ success: true }, 200],
            [{ success: false }, 500],
        ])("deleteAccount maps service result %#", async (serviceResult, status) => {
            const req = { user: { id: "u1", role: "customer", iat: 0, exp: 1 } } as unknown as Request;
            const res = createRes();
            (userServices.removeUser as jest.Mock).mockResolvedValue(serviceResult);

            await deleteAccount(req, res as Response);

            expect(res.status).toHaveBeenCalledWith(status);
        });
    });

    describe("admin helpers", () => {
        it.each([
            [{ body: {} }, 400],
            [{ body: { username: "taken" } }, 200],
            [{ body: { username: "free" } }, 200],
        ])("checkUsername scenarios %#", async (reqObj, status) => {
            const req = reqObj as Partial<Request>;
            const res = createRes();
            const body = (reqObj as { body?: { username?: string } }).body;
            (userServices.findUserByUserName as jest.Mock).mockResolvedValue(
                body?.username === "taken" ? { _id: "u1" } : null,
            );

            await checkUsername(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(status);
        });

        it.each([
            [{ body: {} }, 400],
            [{ body: { email: "a@a.com" } }, 200],
            [{ body: { email: "b@b.com" } }, 200],
        ])("checkEmail scenarios %#", async (reqObj, status) => {
            const req = reqObj as Partial<Request>;
            const res = createRes();
            const body = (reqObj as { body?: { email?: string } }).body;
            (userServices.findUserByEmail as jest.Mock).mockResolvedValue(
                body?.email === "a@a.com" ? { _id: "u1" } : null,
            );

            await checkEmail(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(status);
        });

        it.each([
            [{ username: "u1", name: "John", email: "a@a.com", password: "pass12345", mobile_no: "1234567890", role: "customer" }, { success: true }, 201],
            [{ username: "u2", name: "Jane", email: "b@b.com", password: "pass12345", mobile_no: "1234567890", role: "artisan" }, { success: false }, 500],
        ])("addUserHandler mapping %#", async (body, serviceResult, status) => {
            const req = { body } as Partial<Request>;
            const res = createRes();
            (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");
            (userServices.addUser as jest.Mock).mockResolvedValue(serviceResult);

            await addUserHandler(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(status);
        });

        it.each([
            [{ params: {} }, 400],
            [{ params: { userId: "u1" }, user: { id: "admin", role: "admin", iat: 0, exp: 1 }, body: { reason: "spam" } }, 200],
        ])("deleteUser scenarios %#", async (reqObj, status) => {
            const req = reqObj as unknown as Request;
            const res = createRes();
            (userServices.getUserById as jest.Mock).mockResolvedValue({ _id: "u1", email: "x@y.com", name: "X" });
            (userServices.removeUser as jest.Mock).mockResolvedValue({ success: true });
            (sendMail as jest.Mock).mockResolvedValue({});

            await deleteUser(req, res as Response);

            expect(res.status).toHaveBeenCalledWith(status);
        });

        it.each([
            [{ user: { id: "u1", role: "customer", iat: 0, exp: 1 } }, { _id: "u1", username: "u", name: "N", email: "e", mobile_no: "m", address: {}, role: "customer", isVerified: true, createdAt: new Date(), updatedAt: new Date() }, 200],
            [{ user: { id: "u1", role: "customer", iat: 0, exp: 1 } }, null, 404],
        ])("me endpoint %#", async (reqObj, serviceResult, status) => {
            const req = reqObj as unknown as Request;
            const res = createRes();
            (userServices.getUserById as jest.Mock).mockResolvedValue(serviceResult);

            await me(req, res as Response);

            expect(res.status).toHaveBeenCalledWith(status);
        });
    });
});
