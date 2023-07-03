const db = require('../db')
const noSpaces = require('../utils/noSpaces')

class WorkerController {
  async getDeliveredItems(req, res) {
    try {
      const response = await db.query('select * from all_borrowed_items_view')

      const items = response.rows
        // .map((item) => {
        //   console.log(item)
        //   return item
        // })
        .reduce((result, item) => {
          if (noSpaces(item['Статус']) === 'возврат') return [...result, item]
          const [itemId, applicationId] = [
            item['Инвентарный номер'],
            item['ID заявки']
          ]
          const isThereAcceptance = response.rows.find(
            (el) =>
              el['Инвентарный номер'] === itemId &&
              el['ID заявки'] === applicationId &&
              noSpaces(el['Статус']) === 'возврат'
          )
          if (!isThereAcceptance) return [...result, item]
          if (noSpaces(isThereAcceptance['Статус']) === 'возврат') return result
        }, [])
        .filter((item) => noSpaces(item['Статус']) === 'выдача')
        .map((item) => ({
          itemId: item['Инвентарный номер'],
          name: noSpaces(item['Название'], 'end'),
          applicationId: item['ID заявки'],
          clientLogin: noSpaces(item['Логин сотрудника'], 'end'),
          comment: noSpaces(item['Комментарий'] ?? '', 'end'),
          date: item['Дата']
        }))

      res.json({
        items
      })
    } catch (error) {
      res.json(error.message)
    }
  }
  // async deliverItem(req, res) {
  //   const items = req.body.params.items

  //   const { itemId, applicationId, comment } = req.body.params.item

  //   const date = new Date()

  //   const month =
  //     date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
  //   const day =
  //     date.getDate() < 10 ? `0${date.getDate()}` : date.getDate().toString()
  //   const year = date.getFullYear()

  //   const dateFormat = `${year}-${month}-${day}`

  //   const query = `insert into borrowing_log values (${applicationId}, ${itemId}, 2::smallint, '${comment}', '${dateFormat}')`
  // }
  async acceptItem(req, res) {
    const { itemId, applicationId, comment } = req.body.params.item

    const date = new Date()

    const month =
      date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
    const day =
      date.getDate() < 10 ? `0${date.getDate()}` : date.getDate().toString()
    const year = date.getFullYear()

    const dateFormat = `${year}-${month}-${day}`

    const query = `insert into borrowing_log values (${applicationId}, ${itemId}, 2::smallint, '${comment}', '${dateFormat}')`
    // console.log(query)

    await db.query(query)
  }
  async getActiveApplications(req, res) {
    const activeApplicationsRes = await db.query(
      'select * from actual_requests_view'
    )

    const activeApplications = activeApplicationsRes.rows

    const applicationIds = activeApplications
      .map((application) => application['ID заявки'])
      .reduce((result, item) => {
        return result.includes(item) ? result : [...result, item]
      }, [])

    const deliveredItemsRes = await db.query(
      'select * from borrowed_items_view'
    )
    const deliveredItems = deliveredItemsRes.rows

    const normalizedActiveApplications = applicationIds.map((id) => ({
      applicationId: id,
      items: activeApplications.reduce((result, item) => {
        return item['ID заявки'] === id
          ? [
              ...result,
              {
                itemTypeId: item['ID оборудования'],
                name: noSpaces(item['Название оборудования']),
                count: +item['Количество']
              }
            ]
          : result
      }, []),
      client: {
        id: activeApplications.find((el) => el['ID заявки'] === id)[
          'ID сотрудника'
        ],
        login: noSpaces(
          activeApplications.find((el) => el['ID заявки'] === id)[
            'Логин сотрудника'
          ]
        )
      }
    }))

    normalizedActiveApplications.forEach((application) =>
      application.items.forEach((item) => {
        const deliveredItemsCount = deliveredItems.filter(
          (deliveredItem) =>
            deliveredItem['ID заявки'] === application.applicationId &&
            noSpaces(deliveredItem['Название']) === item.name &&
            noSpaces(deliveredItem['Статус']) === 'выдача'
        ).length

        item.count - deliveredItemsCount
      })
    )

    res.json({
      items: normalizedActiveApplications
    })
  }
  async getItemTypes(req, res) {
    const itemTypesRes = await db.query('select * from tool_type')

    const itemTypes = itemTypesRes.rows.map((item) => ({
      itemTypeId: item.id,
      name: noSpaces(item.name)
    }))

    res.json({
      items: itemTypes
    })
  }
  async addNewItemType(req, res) {
    try {
      const { name } = req.body.params.item

      await db.query('insert into tool_type(name) values ($1)', [name])

      res.json({
        message: 'ok'
      })
    } catch (error) {
      res.json({
        message: 'error'
      })
    }
  }
  async addNewItem(req, res) {
    const { itemTypeId } = req.body.params.item

    await db.query('insert into tool_item(id_tool_type) values ($1)', [
      itemTypeId
    ])
  }
  async getAvailableItems(req, res) {
    const itemsLogRes = await db.query('select * from all_borrowed_items_view')
    const itemsLog = itemsLogRes.rows

    const allItemsRes = await db.query('select * from tool_item_view2')
    const allItems = allItemsRes.rows.map((el) => ({
      itemId: el['Инвентарный номер'],
      itemTypeId: el['ID типа'],
      name: noSpaces(el['Название типа']),
      status: 2
    }))

    itemsLog.forEach((item) => {
      if (noSpaces(item['Статус']) === 'возврат') return

      const [itemId, applicationId] = [
        item['Инвентарный номер'],
        item['ID заявки']
      ]
      const isThereAcceptance = itemsLog.find(
        (el) =>
          el['Инвентарный номер'] === itemId &&
          el['ID заявки'] === applicationId &&
          noSpaces(el['Статус']) === 'возврат'
      )

      if (!isThereAcceptance)
        allItems.find((el) => el.itemId === itemId).status = 1
      return
    })

    const availableItems = allItems.reduce(
      (result, item) =>
        item.status === 2
          ? [
              ...result,
              {
                itemId: item.itemId,
                itemTypeId: item.itemTypeId,
                name: item.name
              }
            ]
          : result,
      []
    )

    // const response = await db.query('select * from availiable_items_view')

    // const items = response.rows.map((item) => ({
    //   itemId: item['Инвентарный номер'],
    //   itemTypeId: item['ID типа'],
    //   name: noSpaces(item['Название типа'], 'end')
    // }))

    res.json({
      items: availableItems
    })
  }
  async deliverItem(req, res) {
    try {
      const items = req.body.params.items

      const date = new Date()

      const month =
        date.getMonth() + 1 < 10
          ? `0${date.getMonth() + 1}`
          : date.getMonth() + 1
      const day =
        date.getDate() < 10 ? `0${date.getDate()}` : date.getDate().toString()
      const year = date.getFullYear()

      const dateFormat = `${year}-${month}-${day}`

      const query = `insert into borrowing_log values `

      const values = items.reduce((result, item, i) => {
        const coma = i === items.length - 1 ? ';' : ', '
        const value = `(${item.applicationId}, ${item.itemId}, 1::smallint, '', '${dateFormat}')${coma}`
        return `${result}${value}`
      }, ``)

      await db.query(query + values)

      // const decrementQuery = items.reduce((result, item, i) => {
      //   const value = `update request_item set number = number - 1 where id_request = ${item.applicationId} and id_tool_type = ${item.itemId}::smallint; `
      //   return `${result}${value}`
      // }, ``)

      // console.log(decrementQuery)

      // await db.query(decrementQuery)

      res.json({
        message: 'ok'
      })
    } catch (error) {
      res.json({
        message: 'error'
      })
    }
  }
  async getItemsLog(req, res) {
    const response = await db.query('select * from log_view')

    const items = response.rows.map((item) => ({
      itemId: item['Инвентарный номер'],
      applicationId: item['ID заявки'],
      clientLogin: noSpaces(item['Логин сотрудника']),
      comment: noSpaces(item['Комментарий']),
      name: noSpaces(item['Название']),
      status: noSpaces(item['Статус']),
      date: item['Дата']
    }))

    res.json({
      items
    })
  }
}

module.exports = new WorkerController()
