const db = require('../db')
const noSpaces = require('../utils/noSpaces')

class UserController {
  async authUser(req, res) {
    const { login, password } = req.query
    try {
      const response = await db.query('select * from get_user_by_login($1)', [
        login
      ])

      let user = {}
      let message = ''

      if (response.rows[0].ID === null) {
        message = 'Пользователь с таким логином не найден'
        user = null
      } else {
        if (noSpaces(response.rows[0]['Пароль']) !== password) {
          message = 'Неверный пароль'
          user = null
        } else {
          message = 'Вход выполнен успешно'
          user = {
            id: response.rows[0]['ID'],
            login: noSpaces(response.rows[0]['Логин']),
            password: noSpaces(response.rows[0]['Пароль']),
            role: noSpaces(response.rows[0]['Роль'])
          }
        }
      }

      res.json({
        user: user,
        message: message
      })
    } catch (error) {
      res.json(error.message)
    }
  }
}

module.exports = new UserController()
