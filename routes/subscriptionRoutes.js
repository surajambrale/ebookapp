const express = require('express');
const router = express.Router();

const subscriptionController = require('../controllers/subscriptionController');
const requireAuth = require('../middleware/auth');
const verifyAdmin = require('../middleware/verifyAdmin');

router.get('/status', requireAuth, subscriptionController.checkSubscription);
router.get('/history', requireAuth, subscriptionController.getMySubscriptionHistory);
router.get('/user/:userId', verifyAdmin, subscriptionController.getUserSubscription);
router.get('/all', verifyAdmin, subscriptionController.getAllSubscriptions);
router.post('/create-order', requireAuth, subscriptionController.createSubscriptionOrder);
router.post('/verify-payment', requireAuth, subscriptionController.verifySubscriptionPayment);
router.delete('/delete/:id', verifyAdmin, subscriptionController.deleteSubscription);

module.exports = router;
