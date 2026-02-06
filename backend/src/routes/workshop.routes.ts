import express from "express";
import {
  bookUserWorkshop,
  getAcceptedWorkshopsForCustomers,
  getUserWorkshops,
  getWorkshops,
  handleWorksopAction,
} from "../controller/workshopController.js";
import authorizerole from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authorizerole("artisan", "manager", "admin"), getWorkshops);

router.get(
  "/accepted",
  authorizerole("customer", "artisan", "manager", "admin"),
  getAcceptedWorkshopsForCustomers
);

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
  authorizerole("artisan", "manager", "admin"),
  handleWorksopAction
);

export default router;
