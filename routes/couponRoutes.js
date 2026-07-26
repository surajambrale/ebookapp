const express = require('express');

const router = express.Router();

const {

    createCoupon,

    getCoupons,

    updateCoupon,

    deleteCoupon,

    verifyCoupon

} = require('../controllers/couponController');


// =========================
// CREATE
// =========================

router.post('/create', createCoupon);


// =========================
// GET ALL
// =========================

router.get('/all', getCoupons);


// =========================
// UPDATE
// =========================

router.put('/update/:id', updateCoupon);


// =========================
// DELETE
// =========================

router.delete('/delete/:id', deleteCoupon);


// =========================
// VERIFY
// =========================

router.post('/verify', verifyCoupon);


module.exports = router;