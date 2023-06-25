const express = require('express')
const router = express.Router()
const BorrowedItemsByUserController = require('../controllers/borrowed-items-by-user')

router.get('/', BorrowedItemsByUserController.getItems)

module.exports = router