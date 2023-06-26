const db = require('../db')
const noSpaces = require('../utils/noSpaces')

class BorrowedItemsByUserController {
  async getItems(req, res) {
    const { id_user } = req.query
    try {
      const response = await db.query('select * from borrowed_items_by_user($1::smallint)',
    [ id_user ])

      const items = response.rows.map((item) => ({
        inv_num: item['Инвентарный номер'],
        id_request: item['ID заявки'],
        name: noSpaces(item['Название']),
        date: item['Дата'].toISOString().split('T')[0]
      }))

      res.json({
        items: items
      })
    } catch (error) {
      res.json(error.message)
    }
  }
}

module.exports = new BorrowedItemsByUserController()
