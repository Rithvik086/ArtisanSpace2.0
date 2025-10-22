import express from "express";
import { verifytoken } from "../middleware/authMiddleware.js";
// import adminroutes from "../routes/adminroutes.js";
// import managerroutes from "../routes/managerroutes.js";
// import customerroutes from "../routes/customerroutes.js";
// import artisanroutes from "../routes/artisanroutes.js";
import dataRoutes from "../routes/data.routes.js";
import {
  deleteAccount,
  submitSuppotTicket,
  updatProfile,
} from "../controller/userController.js";
const router = express.Router();

router.use(verifytoken);

// router.use("/admin", adminroutes);
// router.use("/artisan", artisanroutes);
// router.use("/customer", customerroutes);
// router.use("/manager", managerroutes);
router.use("/data", dataRoutes);
router.post("/submit-ticket", submitSuppotTicket);
router.post("/update-profile", updatProfile);
router.get("/delete-account", deleteAccount);
export default router;
