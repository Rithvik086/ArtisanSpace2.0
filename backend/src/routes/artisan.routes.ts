import express from "express";
import { verifytoken } from "../middleware/authMiddleware.js";
import authorizerole from "../middleware/roleMiddleware.js";
import {
    getArtisanAnalytics,
    getArtisanOrderTrend,
} from "../controller/artisanController.js";

const router = express.Router();

// All routes require artisan role
router.use(verifytoken);
router.use(authorizerole("artisan"));

/**
 * GET /artisan/analytics
 * Get comprehensive analytics dashboard for artisan
 * Returns: revenue, orders, product stats, custom requests, workshops
 */
router.get("/analytics", getArtisanAnalytics);

/**
 * GET /artisan/analytics/trend
 * Get order and revenue trend for last 30 days
 */
router.get("/analytics/trend", getArtisanOrderTrend);

export default router;
