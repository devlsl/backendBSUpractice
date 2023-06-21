const db = require('../db')
const noSpaces = require('../utils/noSpaces')

class BorrowedItemsController {
  async getItems(req, res) {
    try {
      const response = await db.query('select * from borrowed_items')

      const items = response.rows.map((item) => ({
        id: item['Инвентарный номер'],
        name: noSpaces(item['Название'])
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
