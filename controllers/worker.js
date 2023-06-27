const db = require('../db')
const noSpaces = require('../utils/noSpaces')

class WorkerController {
  async getDeliveredItems(req, res) {
    try {
      const response = await db.query('select * from borrowed_items_view')

      const items = response.rows.map((item) => ({
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

    const normalizedActiveApplications = applicationIds.map((id) => ({
      applicationId: id,
      items: activeApplications.reduce((result, item) => {
        return item['ID заявки'] === id
          ? [
              ...result,
              {
                itemTypeId: item['ID оборудования'],
                name: noSpaces(item['Название оборудования']),
                count: item['Количество']
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

    // console.log(
    //   activeApplications.find((el) => el['ID заявки'] === 15)['ID сотрудника']
    // )
    // console.log(activeApplications)

    res.json({
      items: normalizedActiveApplications
    })

    // 'ID оборудования': 11,
    // 'Название оборудования': 'испаритель                    ',
    // 'Количество': '1'

    //     itemTypeId: number
    //   name: string
    // }

    // export interface CountedItem {
    //   count: number

    // console.log(applicationIds)

    // const normalizedActiveApplications = activeApplications.

    //   applicationId: number
    // items: CountedTypedItem[]
    // client: {
    //   id: number
    //   login: string
    // }

    // 'ID заявки': 15,
    // 'ID сотрудника': 1,
    // 'Логин сотрудника': 'ivanov    ',
    // 'ID оборудования': 11,
    // 'Название оборудования': 'испаритель                    ',
    // 'Количество': '1'

    // res.json({
    //   items: activeApplications
    // })
  }
  async handleApplication(res, req) {}
}

module.exports = new WorkerController()
