const express = require('express')
const router = express.Router()
const clientController = require('../controllers/client')

router.post('/', clientController.addApplication)

module.exports = router
