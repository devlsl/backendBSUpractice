const express = require('express')
const router = express.Router()
const workerController = require('../controllers/worker')

router.get('/items/delivered', workerController.getDeliveredItems)
router.post('/item/accept', workerController.acceptItem)
router.post('/item/deliver', workerController.deliverItem)
router.get('/items/log', workerController.getItemsLog)
router.get('/items/available', workerController.getAvailableItems)
router.get('/applications/active', workerController.getActiveApplications)
router.get('/items/types', workerController.getItemTypes)
router.post('/items/new', workerController.addNewItem)
router.post('/items/types/new', workerController.addNewItemType)

module.exports = router
