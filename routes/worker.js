const express = require('express')
const router = express.Router()
const workerController = require('../controllers/worker')

router.get('/items/delivered', workerController.getDeliveredItems)
router.post('/items/accept', workerController.acceptItem)
router.get('/applications/active', workerController.getActiveApplications)
router.post('/applications/handle', workerController.acceptItem)

module.exports = router
