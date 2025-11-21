const express = require('express');
const { 
    getProfile, 
    updateProfile, 
    updatePassword,
    deleteAccount
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/profile')
    .get(getProfile)
    .put(updateProfile);

router.put('/password', updatePassword);
router.delete('/account', deleteAccount);

module.exports = router;