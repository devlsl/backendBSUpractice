const db = require('../db')
const noSpaces = require('../utils/noSpaces')

class BorrowedItemsController {
  async getItems(req, res) {
    try {
      const response = await db.query('select * from borrowed_items_view')

      const items = response.rows.map((item) => ({
        id_request: item['ID заявки'],
        id_user: item['ID сотрудника'],
        login: noSpaces(item['Логин сотрудника']),
        inv_num: item['Инвентарный номер'],
        name: noSpaces(item['Название']),
        date: item['Дата'].toISOString().split('T')[0],
        comment: item['Комментарий']
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
