import { Router } from 'express';
import { DataSource } from 'typeorm';
import { CityController } from '../controllers/CityController';

/**
 * @swagger
 * tags:
 *   name: Cities
 *   description: City management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     City:
 *       type: object
 *       properties:
 *         cityId:
 *           type: integer
 *           example: 1
 *         cityName:
 *           type: string
 *           example: "Addis Ababa"
 *         gps:
 *           type: string
 *           example: "9.0320,38.7469"
 *         status:
 *           type: string
 *           enum: [active, disabled]
 *           example: "active"
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * Create city routes
 */
export function createCityRoutes(dataSource: DataSource): Router {
  const router = Router();
  const cityController = new CityController(dataSource);

  /**
   * @swagger
   * /api/v1/cities:
   *   post:
   *     summary: Create a new city
   *     tags: [Cities]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - cityName
   *               - gps
   *             properties:
   *               cityName:
   *                 type: string
   *                 maxLength: 100
   *                 example: "Addis Ababa"
   *               gps:
   *                 type: string
   *                 pattern: '^-?([0-9]{1,2}|1[0-7][0-9]|180)(\.\d+)?,-?([0-9]{1,2}|1[0-7][0-9]|180)(\.\d+)?$'
   *                 example: "9.0320,38.7469"
   *     responses:
   *       201:
   *         description: City created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/City'
   *                 message:
   *                   type: string
   *                   example: "City created successfully"
   *       400:
   *         description: Invalid input
   *       409:
   *         description: City name already exists
   *       500:
   *         description: Internal server error
   */
  router.post('/', (req, res) => cityController.createCity(req, res));

  /**
   * @swagger
   * /api/v1/cities:
   *   get:
   *     summary: Get all cities
   *     tags: [Cities]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *         description: Items per page
   *     responses:
   *       200:
   *         description: Cities retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/City'
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     page:
   *                       type: integer
   *                       example: 1
   *                     limit:
   *                       type: integer
   *                       example: 20
   *                     total:
   *                       type: integer
   *                       example: 50
   *                     totalPages:
   *                       type: integer
   *                       example: 3
   *       500:
   *         description: Internal server error
   */
  router.get('/', (req, res) => cityController.getAllCities(req, res));

  /**
   * @swagger
   * /api/v1/cities/{cityId}:
   *   get:
   *     summary: Get city by ID
   *     tags: [Cities]
   *     parameters:
   *       - in: path
   *         name: cityId
   *         required: true
   *         schema:
   *           type: integer
   *         description: City ID
   *     responses:
   *       200:
   *         description: City retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/City'
   *       404:
   *         description: City not found
   *       500:
   *         description: Internal server error
   */
  router.get('/:cityId', (req, res) => cityController.getCityById(req, res));

  /**
   * @swagger
   * /api/v1/cities/{cityId}:
   *   put:
   *     summary: Update city
   *     tags: [Cities]
   *     parameters:
   *       - in: path
   *         name: cityId
   *         required: true
   *         schema:
   *           type: integer
   *         description: City ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               cityName:
   *                 type: string
   *                 maxLength: 100
   *                 example: "Addis Ababa"
   *               gps:
   *                 type: string
   *                 example: "9.0320,38.7469"
   *               status:
   *                 type: string
   *                 enum: [active, disabled]
   *                 example: "active"
   *     responses:
   *       200:
   *         description: City updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/City'
   *                 message:
   *                   type: string
   *                   example: "City updated successfully"
   *       400:
   *         description: Invalid input
   *       404:
   *         description: City not found
   *       500:
   *         description: Internal server error
   */
  router.put('/:cityId', (req, res) => cityController.updateCity(req, res));

  /**
   * @swagger
   * /api/v1/cities/{cityId}:
   *   delete:
   *     summary: Delete city (soft delete)
   *     tags: [Cities]
   *     parameters:
   *       - in: path
   *         name: cityId
   *         required: true
   *         schema:
   *           type: integer
   *         description: City ID
   *     responses:
   *       204:
   *         description: City deleted successfully
   *       404:
   *         description: City not found
   *       409:
   *         description: Cannot delete city with active hotels
   *       500:
   *         description: Internal server error
   */
  router.delete('/:cityId', (req, res) => cityController.deleteCity(req, res));

  return router;
}
