/// <reference types="jest" />

import type { Request, Response } from "express";
import {
    addProduct,
    bulkAddProducts,
    deleteProduct,
    editProduct,
    getAllProducts,
    getProductById,
    getProducts,
    getUserProducts,
    productsModeration,
    updateProductImageController,
    updateRejectionReasonController,
    updateRemovalReasonController,
} from "../productController.js";
import * as productServices from "../../services/productServices.js";
import cloudinary from "../../config/cloudinary.js";
import { Redis } from "../../lib/redis.ts";

jest.mock("../../services/productServices.js");
jest.mock("../../config/cloudinary.js", () => ({
    __esModule: true,
    default: {
        uploader: {
            upload: jest.fn(),
        },
    },
}));
jest.mock("../../lib/redis.ts", () => ({
    Redis: {
        getOrSet: jest.fn(),
        delByPrefix: jest.fn(),
    },
}));

const createRes = (): Partial<Response> => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
});

describe("Product Controller - Extended", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getProducts", () => {
        it("returns products from cache service", async () => {
            const req = { query: {} } as Partial<Request>;
            const res = createRes();
            (Redis.getOrSet as jest.Mock).mockResolvedValue({
                products: [{ _id: "p1" }],
                pagination: { page: 1, limit: 12, total: 1 },
            });

            await getProducts(req as Request, res as Response);

            expect(Redis.getOrSet).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: true, products: [{ _id: "p1" }] }),
            );
        });

        it.each([
            [{ category: "home,decor", page: "2", limit: "6" }, ["home", "decor"], null, 2, 6, null],
            [{ material: "wood,clay", search: " vase " }, null, ["wood", "clay"], 1, 12, "vase"],
            [{ category: ["home", 22], material: ["wood", false] }, ["home"], ["wood"], 1, 12, null],
            [{ page: "bad", limit: "bad" }, null, null, 1, 12, null],
            [{ category: " single " }, ["single"], null, 1, 12, null],
            [{ material: "  clay  " }, null, ["clay"], 1, 12, null],
            [{ search: "" }, null, null, 1, 12, ""],
            [{ category: "a,b,c", material: "m1,m2", search: "abc" }, ["a", "b", "c"], ["m1", "m2"], 1, 12, "abc"],
            [{ category: "alpha,,beta", search: "  " }, ["alpha", "", "beta"], null, 1, 12, ""],
            [{ material: "wood,,metal", page: "0", limit: "0" }, null, ["wood", "", "metal"], 1, 12, null],
            [{ category: "furniture", material: "stone", page: "3", limit: "15", search: " table  " }, ["furniture"], ["stone"], 3, 15, "table"],
            [{ category: ["A", "B", "C"], material: ["X", "Y"] }, ["A", "B", "C"], ["X", "Y"], 1, 12, null],
            [{ category: ["A", 0, "B"], material: [false, "Y"] }, ["A", "B"], ["Y"], 1, 12, null],
            [{ page: "5", limit: "2", search: "glass" }, null, null, 5, 2, "glass"],
        ])(
            "passes normalized filters for %#",
            async (query, expCategory, expMaterial, expPage, expLimit, expSearch) => {
                const req = { query } as Partial<Request>;
                const res = createRes();
                (Redis.getOrSet as jest.Mock).mockImplementation(
                    async (_key: string, resolver: () => Promise<unknown>) => resolver(),
                );
                (productServices.getApprovedProducts as jest.Mock).mockResolvedValue({
                    products: [],
                    pagination: { page: 1, limit: 12, total: 0 },
                });

                await getProducts(req as Request, res as Response);

                expect(productServices.getApprovedProducts).toHaveBeenCalledWith(
                    expCategory,
                    expMaterial,
                    expPage,
                    expLimit,
                    expSearch,
                );
            },
        );
    });

    describe("editProduct", () => {
        it("returns 200 on successful edit", async () => {
            const req = {
                params: { id: "p1" },
                body: { name: "new", oldPrice: "200", newPrice: "150", quantity: "4", description: "d" },
            } as unknown as Request;
            const res = createRes();
            (productServices.updateProduct as jest.Mock).mockResolvedValue({ success: true });

            await editProduct(req, res as Response);

            expect(productServices.updateProduct).toHaveBeenCalledWith("p1", "new", 200, 150, 4, "d");
            expect(Redis.delByPrefix).toHaveBeenCalledWith("products:public:");
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("returns 500 when update service fails", async () => {
            const req = {
                params: { id: "p1" },
                body: { name: "new", oldPrice: "200", newPrice: "150", quantity: "4", description: "d" },
            } as unknown as Request;
            const res = createRes();
            (productServices.updateProduct as jest.Mock).mockResolvedValue({ success: false });

            await editProduct(req, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
        });

        it("throws wrapped error when service throws", async () => {
            const req = {
                params: { id: "p1" },
                body: { name: "new", oldPrice: "x", newPrice: "y", quantity: "z", description: "d" },
            } as unknown as Request;
            const res = createRes();
            (productServices.updateProduct as jest.Mock).mockRejectedValue(new Error("boom"));

            await expect(editProduct(req, res as Response)).rejects.toThrow("Error editing product");
        });
    });

    describe("deleteProduct", () => {
        it.each([
            [{ success: true }, 200],
            [{ success: false }, 500],
        ])("handles delete response %#", async (serviceResponse, status) => {
            const req = { params: { id: "p1" } } as Partial<Request>;
            const res = createRes();
            (productServices.deleteProductService as jest.Mock).mockResolvedValue(serviceResponse);

            await deleteProduct(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(status);
        });
    });

    describe("addProduct", () => {
        const validUser = { id: "u1", role: "artisan", iat: 0, exp: 1 };

        it("rejects missing file", async () => {
            const req = { body: {}, user: validUser } as Partial<Request>;
            const res = createRes();

            await addProduct(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("rejects missing user", async () => {
            const req = { body: {}, file: { path: "x" } } as Partial<Request>;
            const res = createRes();

            await addProduct(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        it("adds product with default material", async () => {
            const req = {
                user: validUser,
                file: { path: "/tmp/img.png" },
                body: {
                    productName: "Lamp",
                    type: "home",
                    price: 500,
                    description: "desc",
                    quantity: 3,
                },
            } as unknown as Request;
            const res = createRes();
            (cloudinary.uploader.upload as jest.Mock).mockResolvedValue({ secure_url: "https://img" });
            (productServices.addProductService as jest.Mock).mockResolvedValue({ success: true });

            await addProduct(req, res as Response);

            expect(productServices.addProductService).toHaveBeenCalledWith(
                "u1",
                "artisan",
                "Lamp",
                "home",
                "unspecified",
                "https://img",
                500,
                3,
                "desc",
            );
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it("returns 500 when upload fails", async () => {
            const req = {
                user: validUser,
                file: { path: "/tmp/img.png" },
                body: { productName: "Lamp", type: "home", price: 500, description: "desc", quantity: 3 },
            } as unknown as Request;
            const res = createRes();
            (cloudinary.uploader.upload as jest.Mock).mockRejectedValue(new Error("upload fail"));

            await addProduct(req, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe("bulkAddProducts", () => {
        const user = { id: "u1", role: "artisan", iat: 0, exp: 1 };

        it.each([
            [{ products: [] }, 400],
            [{}, 400],
            [[], 400],
        ])("rejects invalid payload %#", async (body, status) => {
            const req = { body, user } as Partial<Request>;
            const res = createRes();

            await bulkAddProducts(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(status);
        });

        it("requires auth user", async () => {
            const req = { body: { products: [{ name: "A" }] } } as Partial<Request>;
            const res = createRes();

            await bulkAddProducts(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        it("creates products from body.products", async () => {
            const req = { body: { products: [{ name: "A" }] }, user } as Partial<Request>;
            const res = createRes();
            (productServices.addProductsBulk as jest.Mock).mockResolvedValue([{ success: true }]);

            await bulkAddProducts(req as Request, res as Response);

            expect(productServices.addProductsBulk).toHaveBeenCalledWith("u1", "artisan", [{ name: "A" }]);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it("creates products when body itself is array", async () => {
            const req = { body: [{ name: "A" }], user } as Partial<Request>;
            const res = createRes();
            (productServices.addProductsBulk as jest.Mock).mockResolvedValue([{ success: true }]);

            await bulkAddProducts(req as Request, res as Response);

            expect(productServices.addProductsBulk).toHaveBeenCalledWith("u1", "artisan", [{ name: "A" }]);
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe("productsModeration", () => {
        it.each([
            [{ query: {}, body: {} }, 400, "Missing action parameter"],
            [{ query: { action: "approve" }, body: {} }, 400, "Missing productId parameter"],
            [{ query: { action: "invalid", productId: "p1" }, body: {} }, 400, "Invalid action"],
        ])("validates moderation inputs %#", async (reqObj, status, errMsg) => {
            const req = reqObj as Partial<Request>;
            const res = createRes();

            await productsModeration(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(status);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: errMsg }));
        });

        it("accepts productIds array in body", async () => {
            const req = { body: { action: "approve", productIds: ["p1"] }, query: {} } as Partial<Request>;
            const res = createRes();
            (productServices.approveProduct as jest.Mock).mockResolvedValue({ success: true });

            await productsModeration(req as Request, res as Response);

            expect(productServices.approveProduct).toHaveBeenCalledWith("p1");
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it.each([
            ["approve", "approveProduct", { success: true }, 200],
            ["disapprove", "disapproveProduct", { success: true }, 200],
            ["remove", "deleteProductService", { success: true }, 200],
            ["approve", "approveProduct", { success: false }, 500],
            ["APPROVE", "approveProduct", { success: true }, 200],
            [" DisApprove ", "disapproveProduct", { success: true }, 200],
            [" remove ", "deleteProductService", { success: false }, 500],
        ])(
            "handles moderation action %s",
            async (action, serviceName, serviceResponse, status) => {
                const req = {
                    query: { action, productId: "p1" },
                    body: { reason: "bad quality" },
                } as Partial<Request>;
                const res = createRes();
                (productServices as any)[serviceName].mockResolvedValue(serviceResponse);

                await productsModeration(req as Request, res as Response);

                expect(res.status).toHaveBeenCalledWith(status);
            },
        );
    });

    describe("listing and details", () => {
        it("returns all products", async () => {
            const req = { query: { page: "2", limit: "20" } } as Partial<Request>;
            const res = createRes();
            (productServices.getProducts as jest.Mock).mockResolvedValue({
                products: [{ _id: "p1" }],
                pagination: { page: 2, limit: 20, total: 1 },
            });

            await getAllProducts(req as Request, res as Response);

            expect(productServices.getProducts).toHaveBeenCalledWith(null, false, 2, 20);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("returns user products", async () => {
            const req = {
                query: { page: "3", limit: "10" },
                user: { id: "u1", role: "artisan", iat: 0, exp: 1 },
            } as unknown as Request;
            const res = createRes();
            (productServices.getProducts as jest.Mock).mockResolvedValue({
                products: [{ _id: "p1" }],
                pagination: { page: 3, limit: 10, total: 1 },
            });

            await getUserProducts(req, res as Response);

            expect(productServices.getProducts).toHaveBeenCalledWith("u1", false, 3, 10);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("returns 400 without product id", async () => {
            const req = { params: {} } as Partial<Request>;
            const res = createRes();

            await getProductById(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("returns product detail", async () => {
            const req = { params: { id: "p1" } } as Partial<Request>;
            const res = createRes();
            (productServices.getProductById as jest.Mock).mockResolvedValue({ _id: "p1" });

            await getProductById(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, product: { _id: "p1" } });
        });

        it("returns 404 when detail fetch fails", async () => {
            const req = { params: { id: "p1" } } as Partial<Request>;
            const res = createRes();
            (productServices.getProductById as jest.Mock).mockRejectedValue(new Error("not found"));

            await getProductById(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe("image and reason updates", () => {
        it.each([
            [{ params: {}, file: { path: "x" } }, 400, "Product ID is required"],
            [{ params: { id: "p1" } }, 400, "No image file uploaded"],
        ])("validates image update %#", async (reqObj, status, error) => {
            const req = reqObj as Partial<Request>;
            const res = createRes();

            await updateProductImageController(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(status);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error }));
        });

        it.each([
            ["updateProductRejectionReason", updateRejectionReasonController, "Rejection reason is required"],
            ["updateProductRemovalReason", updateRemovalReasonController, "Removal reason is required"],
        ])(
            "validates reason requirement for %s",
            async (_serviceName, handler, expectedError) => {
                const req = { params: { id: "p1" }, body: { reason: "" } } as Partial<Request>;
                const res = createRes();

                await handler(req as Request, res as Response);

                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expectedError }));
            },
        );

        it.each([
            ["updateProductRejectionReason", updateRejectionReasonController],
            ["updateProductRemovalReason", updateRemovalReasonController],
        ])("updates reason via %s", async (serviceName, handler) => {
            const req = { params: { id: "p1" }, body: { reason: "duplicate" } } as Partial<Request>;
            const res = createRes();
            (productServices as any)[serviceName].mockResolvedValue({
                success: true,
                message: "updated",
                product: { _id: "p1" },
            });

            await handler(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: true, message: "updated" }),
            );
        });

        it("updates image successfully", async () => {
            const req = {
                params: { id: "p1" },
                file: { path: "/tmp/new.png" },
            } as unknown as Request;
            const res = createRes();
            (cloudinary.uploader.upload as jest.Mock).mockResolvedValue({ secure_url: "https://img/new" });
            (productServices.updateProductImage as jest.Mock).mockResolvedValue({ success: true });

            await updateProductImageController(req, res as Response);

            expect(productServices.updateProductImage).toHaveBeenCalledWith("p1", "https://img/new");
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("returns 500 when reason service fails", async () => {
            const req = { params: { id: "p1" }, body: { reason: "test" } } as Partial<Request>;
            const res = createRes();
            (productServices.updateProductRejectionReason as jest.Mock).mockResolvedValue({ success: false });

            await updateRejectionReasonController(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
