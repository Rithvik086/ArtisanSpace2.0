import express from "express";
import upload from "../middleware/multer.js";
import {
  approveCustomRequest,
  deleteCustomRequest,
  getCustomRequests,
  reqCustomOrder,
    getUserCustomRequests
} from "../controller/customRequestController.js";
import authorizerole from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authorizerole("artisan", "manager", "admin"),
  getCustomRequests
);

router.post(
  "/",
  authorizerole("customer", "artisan", "manager", "admin"),
  upload.single("image"),
  reqCustomOrder
);

router.put("/", authorizerole("manager", "admin"), approveCustomRequest);


router.get(
    "/my-requests", // <-- ADD THIS NEW ROUTE
    authorizerole("customer", "artisan", "manager", "admin"),
    getUserCustomRequests
);

router.delete(
  "/:requestId",
  authorizerole("manager", "admin"),
  deleteCustomRequest
);

export default router;
