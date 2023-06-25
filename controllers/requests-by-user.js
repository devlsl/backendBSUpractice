const db = require('../db')
const noSpaces = require('../utils/noSpaces')

class RequestsByUserController {
  async getRequests(req, res) {
    const { id_user } = req.query
    try {
      const response = await db.query('select * from requsets_by_user($1::smallint)',
      [ id_user ])

      const requests = response.rows.map((request) => ({
        id_request: request['ID заявки'],
        name: noSpaces(request['Название оборудования']),
        num: request['Требуется ещё']
      }))

      res.json({
        requests: requests
      })
    } catch (error) {
      res.json(error.message)
    }
  }
}

module.exports = new RequestsByUserController()