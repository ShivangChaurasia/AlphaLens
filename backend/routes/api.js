const express = require('express');
const router = express.Router();
const researchController = require('../controllers/researchController');

router.post('/research', researchController.researchCompany);

module.exports = router;
