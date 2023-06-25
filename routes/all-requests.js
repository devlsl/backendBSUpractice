const express = require('express')
const router = express.Router()
const allRequestsController = require('../controllers/all-requests')

router.get('/', allRequestsController.getRequests)

module.exports = router
