// backend/routes/inquiries.js
const express = require('express');
const {
    getMyInquiries,
    getBuyerInquiries,
    getInquiry,
    createInquiry,
    updateInquiryStatus,
    addResponse,
    getDashboardStats
} = require('../controllers/inquiryController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/manufacturer', authorize('manufacturer'), getMyInquiries);
router.get('/buyer', authorize('buyer'), getBuyerInquiries);
router.get('/stats', authorize('manufacturer'), getDashboardStats);
router.put('/:id/status', authorize('manufacturer'), updateInquiryStatus);

router.post('/', authorize('buyer'), createInquiry);

router.get('/:id', getInquiry);
router.post('/:id/respond', addResponse);

module.exports = router;