import express from "express";
import upload from "../middleware/multer.js";
import { reqCustomOrder } from "../controller/customRequestController.js";

const router = express.Router();

router.post("/", upload.single("image"), reqCustomOrder);

export default router;
