const formidable = require('formidable')
const DBOperations = require('../common_libs/db_operations')

const User = {
    form: function (req, res) {
        if (req.session.user_id) {
            res.redirect('/account/home')
            return
        }
        res.render('user_form_template')
    },
    create: function (req, res) {
        user = {
            userid: '',
            name: '',
            password: ''
        }
        var form = new formidable.IncomingForm()
        form.parse(req, function (err, fields, files) {
            if (!err) {
                user['userid'] = fields.userid
                user['name'] = fields.name
                user['password'] = fields.password
                DBOperations.findDB({ userid: user['userid'] }, {}, 1, 'users')
                    .then(resultSet => {
                        if (resultSet.length)
                            throw new Error('The user id has already benn taken, try another one.')
                        DBOperations.insertDB(user).then(result => {
                            console.log(`Uer inserted ${result['insertedCount']} document(s)`)
                            res.status(200).render('success_message_template.ejs',
                                context = {
                                    title: 'Account creation successful',
                                    message: 'You have automatically logged in, click <a href="/account/home">here</a> to your main page'
                                })
                        }).catch(err => { throw err })
                    })
                    .catch(err => {
                        wrongMessage(500, res, err)
                    })
            }
        })
    },
    check: function (req, res) {
        var userid = req.query.userid
        if (!userid) {
            wrongMessage(404, res, new Error('Do not do something like this!'))
            return
        }
        DBOperations.findDB({ userid: userid }, {}, 1, 'users')
            .then(resultSet => {
                res.status(200)
                if (resultSet.length) res.end('exist')
                else res.end('no record')
            })
            .catch(err => {
                wrongMessage(500, res, err)
            })
    },
    login: function (req, res) {
        form = new formidable.IncomingForm()
        form.parse(req, (err, fields, files) => {
            if (!err) {
                var userid = fields.userid
                var password = fields.password
                if (!userid || !password) {
                    wrongMessage(404, res, new Error('Empty user id or password!'))
                    return
                }
                DBOperations.findDB({ userid: userid, password: password }, {}, 1, 'users')
                    .then(ressultSet => {
                        if (resultSet.length) {
                            req.session.userid = userid
                            res.status(200).render('success_message_template',
                                context = {
                                    title: 'login successfully',
                                    message: 'You have successfully logged in, click <a href="/account/home">here</a> to see your restaurants'
                                })
                        }
                        else throw new Error('No such user exists!')
                    })
                    .catch(err => {
                        wrongMessage(404, res, err)
                    })
            }
        })
    }
}
module.exports = User

function wrongMessage(status, res, err) {
    global.redirectionError.status = status
    global.redirectionError.contents = err.message
    if (status === 500) global.redirectionError.title = 'Operation failed!'
    else if (status === 404) global.redirectionError.title = '404 not found!'
    res.redirect('/error')
}