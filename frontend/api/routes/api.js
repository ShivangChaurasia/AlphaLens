const express = require('express');
const router = express.Router();
const researchController = require('../controllers/researchController');
const chartController = require('../controllers/chartController');

router.post('/research', researchController.researchCompany);
router.get('/chart/:ticker', chartController.getChartData);

module.exports = router;
