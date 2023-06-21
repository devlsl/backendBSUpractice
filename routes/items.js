const express = require('express')
const router = express.Router()
const itemsController = require('../controllers/items')

router.get('/', itemsController.getItems)

module.exports = router
