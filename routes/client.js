const express = require('express')
const router = express.Router()
const clientController = require('../controllers/client')

router.post('/application/create', clientController.addApplication)
router.get('/applications/all', clientController.getApplications)

module.exports = router
