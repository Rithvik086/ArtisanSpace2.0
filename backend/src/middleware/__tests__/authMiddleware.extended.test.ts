/// <reference types="jest" />

import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { verifytoken } from "../authMiddleware.js";
import { userExists } from "../../services/userServices.js";

jest.mock("jsonwebtoken");
jest.mock("../../services/userServices.js");
jest.mock("../../utils/logger.js", () => ({
    __esModule: true,
    default: {
        debug: jest.fn(),
        warn: jest.fn(),
    },
}));

type MockReq = Partial<Request> & {
    cookies: { token?: string };
    headers: { authorization?: string };
    user?: { id: string; role: string; iat: number; exp: number };
};

const createRes = (): Partial<Response> => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
});

describe("verifytoken middleware - extended", () => {
    let req: MockReq;
    let res: Partial<Response>;
    let next: NextFunction;
    let nextMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { cookies: {}, headers: {} };
        res = createRes();
        nextMock = jest.fn();
        next = nextMock as unknown as NextFunction;
    });

    it("returns 401 when no token is provided", async () => {
        await verifytoken(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Access denied. Please log in." });
        expect(nextMock).not.toHaveBeenCalled();
    });

    it.each([
        [{ cookies: { token: "cookie-token" }, headers: {} }, "cookie-token"],
        [{ cookies: {}, headers: { authorization: "Bearer bearer-token" } }, "bearer-token"],
        [{ cookies: {}, headers: { authorization: "Bearer     spaced-token   " } }, "spaced-token"],
        [{ cookies: { token: "cookie-token" }, headers: { authorization: "Bearer bearer-token" } }, "cookie-token"],
    ])("extracts and verifies token %#", async (request, expectedToken) => {
        const decoded = { id: "u1", role: "customer", iat: 1, exp: 2 };
        req = request as MockReq;
        (jwt.verify as jest.Mock).mockReturnValue(decoded);
        (userExists as jest.Mock).mockResolvedValue(true);

        await verifytoken(req as Request, res as Response, next);

        expect(jwt.verify).toHaveBeenCalledWith(expectedToken, expect.any(String));
        expect(req.user).toEqual(decoded);
        expect(nextMock).toHaveBeenCalledTimes(1);
    });

    it.each([
        [{ authorization: "Token abc" }],
        [{ authorization: "Bearer" }],
        [{ authorization: "" }],
        [{}],
    ])("rejects malformed authorization header %#", async (headers) => {
        req.headers = headers as MockReq["headers"];

        await verifytoken(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(nextMock).not.toHaveBeenCalled();
    });

    it("returns 401 and clears cookie if user no longer exists", async () => {
        req.cookies = { token: "cookie-token" };
        (jwt.verify as jest.Mock).mockReturnValue({
            id: "missing-user",
            role: "customer",
            iat: 1,
            exp: 2,
        });
        (userExists as jest.Mock).mockResolvedValue(false);

        await verifytoken(req as Request, res as Response, next);

        expect(res.clearCookie).toHaveBeenCalledWith("token");
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "User not found. Please sign up." });
        expect(nextMock).not.toHaveBeenCalled();
    });

    it("returns 401 and clears cookie when verification fails with cookie token", async () => {
        req.cookies = { token: "bad-cookie-token" };
        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error("bad token");
        });

        await verifytoken(req as Request, res as Response, next);

        expect(res.clearCookie).toHaveBeenCalledWith("token");
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid token. Please log in." });
        expect(nextMock).not.toHaveBeenCalled();
    });

    it("returns 401 without clearing cookie when verification fails for bearer token", async () => {
        req.headers = { authorization: "Bearer bad-bearer" };
        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error("bad token");
        });

        await verifytoken(req as Request, res as Response, next);

        expect(res.clearCookie).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid token. Please log in." });
    });

    it("maps userExists service failures to 401 response", async () => {
        req.cookies = { token: "cookie-token" };
        (jwt.verify as jest.Mock).mockReturnValue({ id: "u1", role: "customer", iat: 1, exp: 2 });
        (userExists as jest.Mock).mockRejectedValue(new Error("database timeout"));

        await verifytoken(req as Request, res as Response, next);

        expect(res.clearCookie).toHaveBeenCalledWith("token");
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid token. Please log in." });
        expect(nextMock).not.toHaveBeenCalled();
    });
});
