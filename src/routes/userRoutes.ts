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
   *     description: Store or update the user's FCM token for push notifications
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - fcmToken
   *             properties:
   *               fcmToken:
   *                 type: string
   *                 example: "fGxK7nHqRY6..."
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
   *         description: Bad request - FCM token missing
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
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
