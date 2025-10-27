import express from "express";
import {
  bookUserWorkshop,
  getUserWorkshops,
  getWorkshops,
  handleWorksopAction,
} from "../controller/workshopController.js";
import authorizerole from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authorizerole("artisan", "manager", "admin"), getWorkshops);

router.get(
  "/user/:userId",
  authorizerole("customer", "artisan", "manager", "admin"),
  getUserWorkshops
);

router.post(
  "/",
  authorizerole("customer", "artisan", "manager", "admin"),
  bookUserWorkshop
);

router.put(
  "/:action/:workshopId",
  authorizerole("manager", "admin"),
  handleWorksopAction
);

export default router;
