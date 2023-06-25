const express = require('express')
const router = express.Router()
const BorrowedItemsController = require('../controllers/borrowed-items')

router.get('/', BorrowedItemsController.getItems)

module.exports = router
