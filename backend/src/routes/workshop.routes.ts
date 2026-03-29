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

/**
 * @swagger
 * /workshops:
 *   get:
 *     summary: Get all workshops (Artisan/Manager/Admin)
 *     tags: [Workshops]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workshops
 *       403:
 *         description: Forbidden
 */
router.get("/", authorizerole("artisan", "manager", "admin"), getWorkshops);

/**
 * @swagger
 * /workshops/accepted:
 *   get:
 *     summary: Get accepted workshops for customers
 *     tags: [Workshops]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of accepted workshops
 *       403:
 *         description: Forbidden
 */
router.get(
  "/accepted",
  authorizerole("customer", "artisan", "manager", "admin"),
  getAcceptedWorkshopsForCustomers
);

/**
 * @swagger
 * /workshops/user/{userId}:
 *   get:
 *     summary: Get workshops for a specific user
 *     tags: [Workshops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of user's workshops
 *       403:
 *         description: Forbidden
 */
router.get(
  "/user/:userId",
  authorizerole("customer", "artisan", "manager", "admin"),
  getUserWorkshops
);

/**
 * @swagger
 * /workshops:
 *   post:
 *     summary: Book or create a workshop
 *     tags: [Workshops]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Workshop booked/created successfully
 *       403:
 *         description: Forbidden
 */
router.post(
  "/",
  authorizerole("customer", "artisan", "manager", "admin"),
  bookUserWorkshop
);

/**
 * @swagger
 * /workshops/{action}/{workshopId}:
 *   put:
 *     summary: Handle workshop action (approve/reject/etc)
 *     tags: [Workshops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: action
 *         required: true
 *         schema:
 *           type: string
 *         description: Action to perform
 *       - in: path
 *         name: workshopId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workshop ID
 *     responses:
 *       200:
 *         description: Workshop action handled successfully
 *       403:
 *         description: Forbidden
 */
router.put(
  "/:action/:workshopId",
  authorizerole("artisan", "manager", "admin"),
  handleWorksopAction
);

export default router;
