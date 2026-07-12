const express = require('express');

const router = express.Router();

const subscriptionController = require('../controllers/subscriptionController');


// ========================================
// CHECK SUBSCRIPTION STATUS
// ========================================

router.get(
    '/status/:userId',
    subscriptionController.checkSubscription
);


// ========================================
// GET USER SUBSCRIPTION
// ========================================

router.get(
    '/user/:userId',
    subscriptionController.getUserSubscription
);


// ========================================
// GET ALL SUBSCRIPTIONS (ADMIN)
// ========================================

router.get(
    '/all',
    subscriptionController.getAllSubscriptions
);

router.post(
    '/create-order',
    subscriptionController.createSubscriptionOrder
);

router.post(
    '/verify-payment',
    subscriptionController.verifySubscriptionPayment
);

router.delete(

    '/delete/:id',

    subscriptionController.deleteSubscription

);


module.exports = router;