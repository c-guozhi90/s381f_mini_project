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
                if (!user['userid'] || !user['name'] || !user['password']) {
                    wrongMessage(404, res, new Error('Do not pass empty information!'))
                    return
                }
                DBOperations.findDB({ userid: user['userid'] }, {}, 1, 'users')
                    .then(resultSet => {
                        if (resultSet.length)
                            throw new Error('The user id has already benn taken, try another one.')
                        DBOperations.insertDB(user, 'users').then(result => {
                            console.log(`User inserted ${result['insertedCount']} document(s)`)
                            req.session.user_id = user['userid']
                            res.status(200).render('success_message_template',
                                context = {
                                    title: 'Account creation successful',
                                    message: 'You have automatically logged in, click <a href="/account/home/1">here</a> to your homepage'
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
        if (req.session.user_id) {
            res.status(300).redirect('/account/home/1')
            return
        } else if (req.method == 'GET') {
            res.status(200).render('login_form_template')
            return
        }
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
                    .then(resultSet => {
                        if (resultSet.length) {
                            console.log(resultSet)
                            req.session['user_id'] = resultSet[0]['userid']
                            req.session['user_name'] = resultSet[0]['name']
                            res.status(200).render('success_message_template',
                                context = {
                                    title: 'login successfully',
                                    message: 'You have successfully logged in, click <a href="/account/home/1">here</a> to see your restaurants'
                                })
                        }
                        else throw new Error('No such user exists!')
                    })
                    .catch(err => {
                        console.log(err)
                        wrongMessage(404, res, new Error('something went wrong!'))
                    })
            }
        })
    },
    logout: function (req, res) {
        if (req.session.user_id && req.session.user_name) {
            req.session.user_id = req.session.user_name = ''
            res.status(200).redirect('/')
            return
        } else {
            wrongMessage(404, res, new Error('do not do things like this!'))
        }
    },
    home: function (req, res) {
        if (!req.session.user_id) {
            console.log(req.session['user_id'])
            res.status(300).redirect('/account/login')
            return
        }
        var page = req.params.page
        if (page == 1) {
            DBOperations.findDB({ owner: req.session['user_name'] }, { restaurant_id: 1, name: 1 }, 1000) //maximum enquiry count will be 1000
                .then(resultSet => {
                    req.session.ownRestaurants = resultSet
                    res.status(200).render('homepage_template', contents(req.session.ownRestaurants, req.session['user_name'], page))
                })
                .catch(err => {
                    wrongMessage(500, res, err)
                })
        } else {
            if (!page || !req.session.ownRestaurants) {
                res.status(300).redirect('account/home/1')
                return
            }
            res.status(200).render('homepage_template', contents(req.session.ownRestaurants, req.session['user_name'], page))
        }
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
function contents(resultSet, user_name, page) {
    var context = []
    var pages = []
    if (resultSet.length) {
        console.log(resultSet)
        for (i = 0; i < 20 && 20 * (page - 1) + i < resultSet.length; i++) {
            context.push({ restautant: `<a href="/restaurant/${resultSet[20 * (page - 1) + i]['restaurant_id']}">${resultSet[20 * (page - 1) + i]['name']}</a>` })
        }
        for (i = 1; i <= Math.floor(resultSet.length / 20) + 1; i++) {
            pages.push({ link: `/account/home/${i}` })
        }
    } else {
        context.push({ restaurant: 'No restaurants shown. Click <a href="/restaurant/create">here</a> to create the first restaurant!' })
    }
    var title = 'user home'
    var content = { context: context, pages: pages, title: title, curPage: page, user_name: user_name }
    return content
}