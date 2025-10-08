import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../services/AuthService';
import { authenticateToken } from '../middlewares/authMiddleware';
import { Repository } from 'typeorm';
import { User } from '../models/User';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * Create user routes
 */
export function createUserRoutes(userRepository: Repository<User>): Router {
  const router = Router();
  const authService = new AuthService(userRepository);
  const authController = new AuthController(authService);

  // Protected routes
  const authMiddleware = authenticateToken(authService);

  /**
   * @swagger
   * /api/users/fcm-token:
   *   post:
   *     tags: [Users]
   *     summary: Update FCM token
   *     description: Store or update the user's FCM token for push notifications. Accepts both camelCase (fcmToken) and snake_case (fcm_token) field names.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               fcmToken:
   *                 type: string
   *                 example: "fGxK7nHqRY6..."
   *                 description: "FCM device token (camelCase format)"
   *               fcm_token:
   *                 type: string
   *                 example: "fGxK7nHqRY6..."
   *                 description: "FCM device token (snake_case format, alternative)"
   *             oneOf:
   *               - required: [fcmToken]
   *               - required: [fcm_token]
   *     responses:
   *       200:
   *         description: FCM token updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "FCM token updated successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     userId:
   *                       type: string
   *                       example: "uuid-here"
   *       400:
   *         description: Bad request - FCM token missing or invalid
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: "FCM token is required"
   *                 message:
   *                   type: string
   *                   example: "Please provide either \"fcmToken\" or \"fcm_token\" field in the request body"
   *       401:
   *         description: Unauthorized - Invalid or missing token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/fcm-token', 
    authMiddleware,
    authController.updateFcmToken
  );

  return router;
}
