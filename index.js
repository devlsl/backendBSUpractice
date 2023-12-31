const express = require('express')
let cors = require('cors')

const PORT = process.env.PORT || 8080

const app = express()

const userRoute = require('./routes/user')
const itemsRoute = require('./routes/items')
const clientRoute = require('./routes/client')
const workerRoute = require('./routes/worker')

app.use(express.json())
app.use(cors())
app.use('/user', userRoute)
app.use('/items', itemsRoute)
app.use('/client', clientRoute)
app.use('/worker', workerRoute)

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}...`)
})
