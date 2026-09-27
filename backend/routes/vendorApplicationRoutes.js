const express = require('express');
const router = express.Router();
const vendorApplicationController = require('../controllers/vendorApplicationController');

router.post('/', vendorApplicationController.submitApplication);
router.get('/status/:reference', vendorApplicationController.getApplicationStatus);

module.exports = router;