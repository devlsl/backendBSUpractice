const express = require('express')
const router = express.Router()
const RequestsByUserController = require('../controllers/requests-by-user')

router.get('/', RequestsByUserController.getRequests)

module.exports = router