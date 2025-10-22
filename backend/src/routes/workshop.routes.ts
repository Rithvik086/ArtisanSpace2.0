import express from "express";
import {
  bookUserWorkshop,
  getWorkshops,
  handleWorksopAction,
} from "../controller/workshopController.js";

const router = express.Router();

router.get("/", getWorkshops);

router.post("/", bookUserWorkshop);

router.put("/:action/:workshopId", handleWorksopAction);

export default router;
