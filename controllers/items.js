const db = require('../db')
const noSpaces = require('../utils/noSpaces')

class ItemsController {
  async getItems(req, res) {
    try {
      const response = await db.query('select * from tool_item_view')

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

module.exports = new ItemsController()
