// backend/src/routes/settingsRoutes.ts
import { Router } from 'express';
import { getSettings, updateSettings, resetSettings } from '../controllers/settingsController';

const router = Router();

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get user settings
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: User settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 displayName:
 *                   type: string
 *                 tableMetrics:
 *                   type: array
 *                   items:
 *                     type: string
 *                 chartMetrics:
 *                   type: array
 *                   items:
 *                     type: string
 *                 goalWeight:
 *                   type: number
 *                   nullable: true
 *       500:
 *         description: Server error
 */
router.get('/', getSettings);

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Update user settings
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tableMetrics:
 *                 type: array
 *                 items:
 *                   type: string
 *               chartMetrics:
 *                 type: array
 *                 items:
 *                   type: string
 *               goalWeight:
 *                 type: number
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 displayName:
 *                   type: string
 *                 tableMetrics:
 *                   type: array
 *                   items:
 *                     type: string
 *                 chartMetrics:
 *                   type: array
 *                   items:
 *                     type: string
 *                 goalWeight:
 *                   type: number
 *                   nullable: true
 *       500:
 *         description: Server error
 */
router.put('/', updateSettings);

/**
 * @swagger
 * /api/settings/reset:
 *   post:
 *     summary: Reset user settings to defaults
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Settings reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 displayName:
 *                   type: string
 *                 tableMetrics:
 *                   type: array
 *                   items:
 *                     type: string
 *                 chartMetrics:
 *                   type: array
 *                   items:
 *                     type: string
 *                 goalWeight:
 *                   type: number
 *                   nullable: true
 *       500:
 *         description: Server error
 */
router.post('/reset', resetSettings);

export default router;