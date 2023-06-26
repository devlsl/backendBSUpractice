const express = require('express')
let cors = require('cors')

const PORT = process.env.PORT || 8080

const app = express()

const userRoute = require('./routes/user')
const itemsRoute = require('./routes/items')
const applicationsRoute = require('./routes/requests-by-user')
const borrowedItemsRoute = require('./routes/borrowed-items-by-user')
const allBorrowedItemsRoute = require('./routes/all-borrowed-items')
const allRequestsRoute = require('./routes/all-requests')

app.use(express.json())
app.use(cors())
app.use('/user', userRoute)
app.use('/items', itemsRoute)
app.use('/requests-by-user', applicationsRoute)
app.use('/borrowed-items-by-user', borrowedItemsRoute)
app.use('/all-borrowed-items', allBorrowedItemsRoute)
app.use('/all-requests', allRequestsRoute)

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}...`)
})
