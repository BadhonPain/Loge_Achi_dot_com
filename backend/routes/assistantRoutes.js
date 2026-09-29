const express = require('express');
const assistantController = require('../controllers/assistantController');

const router = express.Router();

router.post('/chat', assistantController.chat);

module.exports = router;