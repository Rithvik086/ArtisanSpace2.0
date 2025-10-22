import express from "express";
import upload from "../middleware/multer.js";
import {
  approveCustomRequest,
  deleteCustomRequest,
  getCustomRequests,
  reqCustomOrder,
} from "../controller/customRequestController.js";

const router = express.Router();

router.get("/", getCustomRequests);

router.post("/", upload.single("image"), reqCustomOrder);

router.put("/", approveCustomRequest);

router.delete("/:requestId", deleteCustomRequest);

export default router;
