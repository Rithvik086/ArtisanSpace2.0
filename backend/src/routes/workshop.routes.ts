import express from "express";
import {
  bookUserWorkshop,
  getAcceptedWorkshopsForCustomers,
  getUserWorkshops,
  getWorkshops,
  handleWorksopAction,
} from "../controller/workshopController.js";
import authorizerole from "../middleware/roleMiddleware.js";
import { verifytoken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifytoken);

/**
 * @swagger
 * /workshops:
 *   get:
 *     summary: Get all workshops (Artisan/Manager/Admin)
 *     tags: [Artisan Workshops]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all workshops
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   artisanId:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   duration:
 *                     type: number
 *                     description: Duration in hours
 *                   capacity:
 *                     type: number
 *                   status:
 *                     type: string
 *                     enum: [pending, accepted, rejected]
 *                   attendees:
 *                     type: number
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       403:
 *         description: Forbidden - requires artisan role
 *       500:
 *         description: Internal server error
 */
router.get("/", authorizerole("artisan", "manager", "admin"), getWorkshops);

/**
 * @swagger
 * /workshops/accepted:
 *   get:
 *     summary: Get accepted workshops for customers
 *     tags: [Artisan Workshops]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of accepted workshops available for booking
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   artisanId:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       image:
 *                         type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   duration:
 *                     type: number
 *                   capacity:
 *                     type: number
 *                   availableSeats:
 *                     type: number
 *                   price:
 *                     type: number
 *       500:
 *         description: Internal server error
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
 *     tags: [Artisan Workshops]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
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
 *     tags: [Artisan Workshops]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - date
 *               - duration
 *               - capacity
 *             properties:
 *               title:
 *                 type: string
 *                 description: Workshop title
 *               description:
 *                 type: string
 *                 description: Workshop description
 *               date:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: number
 *                 description: Duration in hours
 *               capacity:
 *                 type: number
 *                 description: Workshop capacity
 *               price:
 *                 type: number
 *                 description: Workshop price
 *               location:
 *                 type: string
 *                 description: Workshop location
 *     responses:
 *       201:
 *         description: Workshop created/booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 status:
 *                   type: string
 *       400:
 *         description: Invalid input data
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /user/workshop:
 *   post:
 *     summary: Book or create a workshop
 *     tags: [Artisan Workshops]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - date
 *               - duration
 *               - capacity
 *             properties:
 *               title:
 *                 type: string
 *                 description: Workshop title
 *               description:
 *                 type: string
 *                 description: Workshop description and details
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Workshop date and time
 *               duration:
 *                 type: number
 *                 description: Duration in hours
 *               capacity:
 *                 type: number
 *                 description: Maximum workshop capacity
 *               price:
 *                 type: number
 *                 description: Price per participant
 *               location:
 *                 type: string
 *                 description: Workshop location/venue
 *               image:
 *                 type: string
 *                 description: Workshop image URL
 *               materials:
 *                 type: string
 *                 description: Materials needed for workshop
 *               difficulty:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *     responses:
 *       201:
 *         description: Workshop created/booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 workshop:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Invalid input data
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
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
 *     tags: [Artisan Workshops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: action
 *         required: true
 *         schema:
 *           type: string
 *           enum: [approve, reject, cancel]
 *         description: Action to perform on workshop
 *       - in: path
 *         name: workshopId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workshop ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for rejection or cancellation
 *     responses:
 *       200:
 *         description: Workshop action completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 status:
 *                   type: string
 *       400:
 *         description: Invalid action
 *       403:
 *         description: Forbidden - requires artisan role
 *       404:
 *         description: Workshop not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:action/:workshopId",
  authorizerole("artisan", "manager", "admin"),
  handleWorksopAction
);

export default router;
