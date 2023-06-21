const db = require('../db')
const noSpaces = require('../utils/noSpaces')

class BorrowedItemsController {
  async getItems(req, res) {
    const { ID_User } = req.query
    try {
      const response = await db.query('select * from borrowed_items_by_user($1)',
    [ ID_User ])

      const items = response.rows.map((item) => ({
        id: item['Инвентарный номер'],
        name: noSpaces(item['Название']),
        request_id: item['ID заявки'],
        login: noSpaces(item['Логин сотрудника']),
        comment: item['Комментарий'],
        date: item['Дата']
      }))

      res.json({
        items: items
      })
    } catch (error) {
      res.json(error.message)
    }
  }
}

module.exports = new BorrowedItemsController()
