const db = require('../db')
const noSpaces = require('../utils/noSpaces')

class ClientController {
  async addApplication(req, res) {
    try {
      const { items, user } = req.body.params

      const itemsIdsRes = await db.query('select * from tool_item')

      const itemsIdsObj = itemsIdsRes.rows.reduce(
        (obj, item) => ({ ...obj, [item.inv_num]: item.id_tool_type }),
        {}
      )

      const itemsWithCount = {}

      items.map((item) => {
        const itemType = itemsIdsObj[item]

        if (itemsWithCount[itemType]) {
          itemsWithCount[itemType] += 1
        } else {
          itemsWithCount[itemType] = 1
        }
      })

      const newApplicationIdRes = await db.query(
        `select new_request(${user.id}::smallint)`
      )

      const newApplicationId = newApplicationIdRes.rows[0].new_request

      for (let itemId in itemsWithCount) {
        await db.query(
          `select new_request_item(${newApplicationId}::smallint, ${itemId}::smallint, ${itemsWithCount[itemId]}::smallint);`
        )
      }

      res.json({
        status: 'ok'
      })
    } catch (error) {
      res.json(error.message)
    }
  }
}

module.exports = new ClientController()
