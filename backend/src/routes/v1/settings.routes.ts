// src/routes/v1/settings.routes.ts

import { Router } from 'express';
import { getSettings, updateSettings, resetSettings } from '../../controllers/settings.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/settings:
 *   get:
 *     summary: Get user settings
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: User settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSettings'
 *       500:
 *         description: Server error
 */
router.get('/', getSettings);

/**
 * @swagger
 * /api/v1/settings:
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
 *                 description: List of metrics to display in the table view
 *               chartMetrics:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of metrics to be available in the chart view
 *               defaultVisibleMetrics:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of metrics visible by default in the chart
 *               goalWeight:
 *                 type: number
 *                 nullable: true
 *                 description: Target weight goal for the user
 *               darkMode:
 *                 type: boolean
 *                 description: Whether dark mode is enabled
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSettings'
 *       500:
 *         description: Server error
 */
router.put('/', updateSettings);

/**
 * @swagger
 * /api/v1/settings/reset:
 *   post:
 *     summary: Reset user settings to defaults
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Settings reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSettings'
 *       500:
 *         description: Server error
 */
router.post('/reset', resetSettings);

export default router;
