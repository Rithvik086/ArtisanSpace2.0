/// <reference types="jest" />

import type { NextFunction, Request, Response } from "express";
import authorizerole from "../roleMiddleware.js";

jest.mock("../../utils/logger.js", () => ({
    __esModule: true,
    default: {
        warn: jest.fn(),
    },
}));

const createRes = (): Partial<Response> => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
});

describe("authorizerole middleware - extended", () => {
    let res: Partial<Response>;
    let next: NextFunction;
    let nextMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        res = createRes();
        nextMock = jest.fn();
        next = nextMock as unknown as NextFunction;
    });

    it("returns 401 when user is not attached to request", () => {
        const req = {} as Request;

        authorizerole("admin")(req, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Unauthorized: Please log in.",
        });
        expect(nextMock).not.toHaveBeenCalled();
    });

    it.each([
        ["customer", ["admin"]],
        ["customer", ["artisan", "delivery"]],
        ["artisan", ["customer"]],
        ["delivery", ["admin", "manager"]],
        ["manager", ["delivery", "customer"]],
        ["admin", ["customer", "artisan", "delivery"]],
        ["customer", []],
        ["unknown-role", ["admin", "manager"]],
    ])("returns 403 when role %s is not in allowed list %#", (role, allowedRoles) => {
        const req = {
            user: { id: "u1", role, iat: 1, exp: 2 },
        } as unknown as Request;

        authorizerole(...allowedRoles)(req, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Forbidden: Access is denied.",
        });
        expect(nextMock).not.toHaveBeenCalled();
    });

    it.each([
        ["admin", ["admin"]],
        ["customer", ["customer"]],
        ["artisan", ["artisan"]],
        ["delivery", ["delivery"]],
        ["manager", ["manager"]],
        ["admin", ["customer", "admin"]],
        ["customer", ["admin", "customer", "artisan"]],
        ["artisan", ["manager", "artisan", "delivery"]],
    ])("calls next when role %s is allowed %#", (role, allowedRoles) => {
        const req = {
            user: { id: "u1", role, iat: 1, exp: 2 },
        } as unknown as Request;

        authorizerole(...allowedRoles)(req, res as Response, next);

        expect(nextMock).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it("does not call next multiple times for a single request", () => {
        const req = {
            user: { id: "u1", role: "admin", iat: 1, exp: 2 },
        } as unknown as Request;

        authorizerole("admin")(req, res as Response, next);

        expect(nextMock).toHaveBeenCalledTimes(1);
    });
});
