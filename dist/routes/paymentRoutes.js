"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentRoutes = createPaymentRoutes;
const express_1 = require("express");
const PaymentController_1 = require("../controllers/PaymentController");
/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing and status management endpoints
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     InitiatePaymentRequest:
 *       type: object
 *       required:
 *         - booking_id
 *         - payment_provider
 *       properties:
 *         booking_id:
 *           type: integer
 *           example: 1
 *           description: ID of the booking to process payment for
 *         payment_provider:
 *           type: string
 *           enum: [chapa, telebirr, cbe_birr, stripe]
 *           example: "chapa"
 *           description: Payment provider to use
 *         return_url:
 *           type: string
 *           format: uri
 *           example: "https://example.com/payment/success"
 *           description: URL to redirect after successful payment
 *         cancel_url:
 *           type: string
 *           format: uri
 *           example: "https://example.com/payment/cancel"
 *           description: URL to redirect after cancelled payment
 *     PaymentInitiationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             payment_id:
 *               type: integer
 *               example: 1
 *             payment_url:
 *               type: string
 *               format: uri
 *               example: "https://api.chapa.co/v1/hosted/pay/TX_REF_123456"
 *               description: URL to redirect user for payment
 *             transaction_reference:
 *               type: string
 *               example: "TX_REF_123456"
 *               description: Unique transaction reference
 *             amount:
 *               type: number
 *               format: decimal
 *               example: 5000.00
 *               description: Payment amount
 *             currency:
 *               type: string
 *               example: "ETB"
 *               description: Payment currency
 *             expires_at:
 *               type: string
 *               format: date-time
 *               example: "2025-01-15T10:30:00Z"
 *               description: Payment link expiration time
 *     PaymentCallbackRequest:
 *       type: object
 *       properties:
 *         transaction_reference:
 *           type: string
 *           example: "TX_REF_123456"
 *         status:
 *           type: string
 *           enum: [success, failed, cancelled]
 *           example: "success"
 *         provider_reference:
 *           type: string
 *           example: "CHAPA_TXN_789012"
 *         amount:
 *           type: number
 *           format: decimal
 *           example: 5000.00
 *         currency:
 *           type: string
 *           example: "ETB"
 *     PaymentStatusResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           allOf:
 *             - $ref: '#/components/schemas/Payment'
 *             - type: object
 *               properties:
 *                 booking:
 *                   $ref: '#/components/schemas/Booking'
 */
/**
 * Create payment routes
 */
function createPaymentRoutes(dataSource) {
    const router = (0, express_1.Router)();
    const paymentController = new PaymentController_1.PaymentController(dataSource);
    /**
     * @swagger
     * /api/payments/initiate:
     *   post:
     *     summary: Initiate payment for a booking
     *     description: Start the payment process for a booking with the specified payment provider
     *     tags: [Payments]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/InitiatePaymentRequest'
     *     responses:
     *       200:
     *         description: Payment initiated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/PaymentInitiationResponse'
     *       400:
     *         description: Invalid request data (invalid booking ID, unsupported provider, etc.)
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       403:
     *         description: Access denied - can only initiate payment for own bookings
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Booking not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       409:
     *         description: Payment already exists for this booking
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Internal server error or payment provider error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.post('/initiate', (req, res) => paymentController.initiatePayment(req, res));
    /**
     * @swagger
     * /api/payments/callback:
     *   post:
     *     summary: Handle payment callback from provider
     *     description: Webhook endpoint for payment providers to notify about payment status changes
     *     tags: [Payments]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/PaymentCallbackRequest'
     *     responses:
     *       200:
     *         description: Callback processed successfully
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
     *                   example: "Payment callback processed successfully"
     *       400:
     *         description: Invalid callback data
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Payment transaction not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.post('/callback', (req, res) => paymentController.handlePaymentCallback(req, res));
    /**
     * @swagger
     * /api/payments/{id}:
     *   get:
     *     summary: Get payment status
     *     description: Retrieve the current status and details of a payment transaction
     *     tags: [Payments]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *           example: 1
     *         description: Payment ID
     *     responses:
     *       200:
     *         description: Payment status retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/PaymentStatusResponse'
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       403:
     *         description: Access denied - can only view own payments
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Payment not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.get('/:id', (req, res) => paymentController.getPaymentStatus(req, res));
    /**
     * @swagger
     * /api/payments/{id}:
     *   put:
     *     summary: Update payment details
     *     description: Update payment status or provider (admin operation)
     *     tags: [Payments]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *           example: 1
     *         description: Payment ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               status:
     *                 type: string
     *                 enum: [pending, success, failed, cancelled]
     *                 example: "success"
     *                 description: New payment status
     *               provider:
     *                 type: string
     *                 enum: [chapa, telebirr, cbe_birr, stripe]
     *                 example: "chapa"
     *                 description: New payment provider (only for pending payments)
     *     responses:
     *       200:
     *         description: Payment updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/PaymentStatusResponse'
     *       400:
     *         description: Invalid request data or status transition
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       403:
     *         description: Access denied - admin only
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Payment not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       422:
     *         description: Invalid operation (cannot change successful payment, etc.)
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.put('/:id', (req, res) => paymentController.updatePayment(req, res));
    /**
     * @swagger
     * /api/payments/{id}:
     *   delete:
     *     summary: Delete payment
     *     description: Delete a payment and cancel associated booking (admin operation)
     *     tags: [Payments]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *           example: 1
     *         description: Payment ID
     *     responses:
     *       200:
     *         description: Payment deleted successfully
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
     *                   example: "Payment deleted successfully"
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: integer
     *                       example: 1
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       403:
     *         description: Access denied - admin only
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Payment not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       422:
     *         description: Cannot delete successful payment
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.delete('/:id', (req, res) => paymentController.deletePayment(req, res));
    return router;
}
