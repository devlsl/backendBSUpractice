const db = require('../db')
const noSpaces = require('../utils/noSpaces')

class allRequestsController {
  async getRequests(req, res) {
    const { id_user } = req.query
    try {
      const response = await db.query('select * from actual_requests_view')

      const requests = response.rows.map((request) => ({
        id_request: request['ID заявки'],
        id_user: request['ID сотрудника'],
        login: noSpaces(request['Логин сотрудника']),
        id_tool_type: request['ID оборудования'],
        name: noSpaces(request['Название оборудования']),
        num: request['Количество']
      }))

      res.json({
        requests: requests
      })
    } catch (error) {
      res.json(error.message)
    }
  }
}

module.exports = new allRequestsController()