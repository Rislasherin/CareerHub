import { Router } from 'express';
import express from 'express';
import { makeSubscriptionController } from '@infrastructure/di/college.factory';
import { authMiddleware } from '@infrastructure/di/infra.container';

const router = Router();
const controller = makeSubscriptionController();

// Webhook needs raw body to verify Razorpay's cryptographic signature!
router.post('/webhook', express.raw({ type: 'application/json' }), controller.webhook);

// Create subscription route (Requires college to be logged in)
router.post('/create', express.json(), authMiddleware.protect, controller.create);
router.get('/my-plan', express.json(), authMiddleware.protect, controller.getMyPlan);

export default router;
