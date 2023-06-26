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
  async getApplications(req, res) {
    try {
      const { user } = req.query

      const applicationsRes = await db.query('select * from request_view')
      const applications = applicationsRes.rows.filter((app) => {
        return noSpaces(app['Логин сотрудника']) === user.login
      })

      const normalizedApplications = applications.map((el) => ({
        applicationId: el['ID заявки'],
        itemId: el['ID оборудования'],
        name: noSpaces(el['Название оборудования']),
        count: el['Количество']
      }))

      const itemsRes = await db.query(
        'select * from borrowed_and_returned_items_view'
      )
      const items = itemsRes.rows

      // console.log(items[1])

      // 19, itemId: 1

      res.json({
        items: normalizedApplications.map((el) => {
          const currentItems = items.filter(
            (item) =>
              item['ID оборудования'] === el.itemId &&
              item['ID заявки'] === el.applicationId
          )

          // console.log(currentItems)

          if (currentItems.length === 2) {
            return { ...el, status: 'Выполнена' }
          }
          if (currentItems.length === 1) {
            return { ...el, status: 'Используется' }
          }
          if (currentItems.length === 0) {
            return { ...el, status: 'В обработке' }
          }
        })
      })
      // select * from request_view
      // console.log(user)
      // ID заявки: 1, Логин сотрудника: 'oleg      ', ID оборудования: 1, Название оборудования: 'микроскоп                     ', Количество: 2

      // -----
      // const { items, user } = req.body.params
      // const itemsIdsRes = await db.query('select * from tool_item')
      // const itemsIdsObj = itemsIdsRes.rows.reduce(
      //   (obj, item) => ({ ...obj, [item.inv_num]: item.id_tool_type }),
      //   {}
      // )
      // const itemsWithCount = {}
      // items.map((item) => {
      //   const itemType = itemsIdsObj[item]
      //   if (itemsWithCount[itemType]) {
      //     itemsWithCount[itemType] += 1
      //   } else {
      //     itemsWithCount[itemType] = 1
      //   }
      // })
      // const newApplicationIdRes = await db.query(
      //   `select new_request(${user.id}::smallint)`
      // )
      // const newApplicationId = newApplicationIdRes.rows[0].new_request
      // for (let itemId in itemsWithCount) {
      //   await db.query(
      //     `select new_request_item(${newApplicationId}::smallint, ${itemId}::smallint, ${itemsWithCount[itemId]}::smallint);`
      //   )
      // }
      // res.json({
      //   status: 'ok'
      // })
    } catch (error) {
      res.json(error.message)
    }
  }
}

module.exports = new ClientController()
