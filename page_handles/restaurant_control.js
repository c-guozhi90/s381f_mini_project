const DBOperation = require('../common_libs/db_operations')
const FormHandle = require('../common_libs/form_operations')
const ObjectId = require('mongodb').ObjectId

const Restaurant = {
    form: function (req, res) {
        if (!req.session.user_name || !req.session.user_id) {
            res.status(300).redirect('/account/login')
            return
        }
        res.status(200)
        res.render('restaurant_form_template')
    },
    create: function (req, res) {
        if (!req.session.user_name || !req.session.user_id) {
            res.status(300).redirect('/account/login')
        }

        FormHandle.form(req)
            .then(({ fields, files }) => {
                return assign(req, fields, files)
            }).then(restaurant => {
                console.log(restaurant)
                DBOperation.insertDB(restaurant)
                    .then(result => {
                        console.log(result.insertedCount + ' document inserted')
                        res.status(200).render('success_message_template',
                            context = {
                                title: 'Operation succeed',
                                message: 'Create restaurant successfully! click <a href="/account/home">here</a> back to your homepage'
                            })
                    }).catch(err => {
                        console.log(err)
                        wrongMessage(500, res, new Error('Insertion failed!'))
                    })
            }).catch(err => {
                console.log(err)
                wrongMessage(500, res, new Error('Parse form failed!'))
            })
    },
    update: function (req, res) {
        if (!req.session.user_id || !req.session.user_name) {
            res.status(300).redirect('/account/login')
            return
        }
        if (!req.param._id) {
            wrongMessage(404, res, new Error('Empty id!'))
            return
        }

        var owner = req.session.user_name
        var _id = ObjectId(req.param._id)
        DBOperation.findDB({ _id, owner })
            .then(resultset => {
                if (resultset.length && req.method == 'GET') {
                    res.status(200).render('restaurant_form_template', context = restaurant[0])
                } else if (resultset.length && req.method == 'POST') {
                    return FormHandle.form(req)
                } else {
                    throw new Error('no such restaurant!')
                }
            })
            .then(({ fields, files }) => {
                return assign(req, fields, files)
            })
            .then(restaurant => {
                DBOperation.updateDB({ _id }, restaurant)
            })
            .catch(err => {
                wrongMessage(404, res, err)
            })
    },
    delete: function (req, res) {
        if (!req.session.user_id || !req.session.user_name) {
            res.status(300).redirect('/account/login')
            return
        }
        if (!req.param._id) {
            wrongMessage(404, res, new Error('Empty id!'))
            return
        }

        var owner = req.session.name
        var _id = ObjectId(req.param._id)
        DBOperation.findDB({ _id, owner })
            .then(resultset => {
                if (resultset.length) {
                    return
                } else {
                    throw new Error('no such restaurant')
                }
            })
            .then(() => {
                DBOperation.deleteDB({ _id, owner })
                    .then(result => {
                        console.log(`user ${owner} deleted ${result.deletedCount} record(s)`)
                        res.status(200).render('success_message_template',
                            context = {
                                title: 'Operation succeeded',
                                message: 'you have deleted your restaurant. click <a href="/account/home/1">here</a> back to your homepage'
                            })
                    })
            })
            .catch(err => {
                wrongMessage(404, res, err)
            })
    },
    detail: function (req, res) {
        if (!req.param._id) {
            wrongMessage(404, res, new Error('Empty id!'))
            return
        }
        var _id = ObjectId(req.param._id)
        DBOperation.findDB({ _id })
            .then(resultset => {
                if (!resultset.length) throw new Error('no such restaurant!')
                var context = []
                var object = {}
                for (prop in resultset[0]) {
                    if (prop == 'address') {
                        for (prop in resultset[0]['address']) {
                            if (prop == 'coord') continue
                            object[prop] = resultset[0]['address'][prop]
                        }
                    }
                    else if (prop != 'photo' && prop != 'photo_mimetype')
                        object[prop] = `<b>${prop}</b>: ${resultset[0][prop]}`
                    else if (prop == 'photo')
                        object[prop] = `data: ${resultset[0]['photo_mimetype']}; base64,${resultset[0]['photo']}`
                }
                context.push(object)
                res.status(200).render('hompage_template',
                    {
                        user_name: req.session.user_name,
                        context,
                        pages: '',
                        curPage: '',
                        mapData: {
                            restaurant_name: `${context[0].name}`,
                            zoom: 18,
                            lat: resultset[0]['address']['coord'][0],
                            lon: resultset[0]['address']['coord'][1]
                        }
                    })
            })
            .catch(err => {
                wrongMessage(404, res, err)
            })
    }
}
module.exports = Restaurant
function wrongMessage(status, res, err) {
    global.redirectionError.status = status
    global.redirectionError.contents = err.message
    switch (status) {
        case 300:
            res.redirect('/account/login')
            break
        default:
            if (status === 404) {
                global.redirectionError.title = '404 not found'
            } else if (status === 500) {
                global.redirectionError.title = '500 server error'
            }
            res.redirect('/error')
    }
}
function assign(req, fields, files) {
    return new Promise((resolve, reject) => {
        if (!fields['name']) {
            throw new Error()
        }
        var restaurant = {
            restaurant_id: fields['restaurant_id'],
            name: fields['name'],
            borough: fields['borough'],
            cuisine: fields['cuisine'],
            address: {
                street: fields['street'],
                building: fields['building'],
                zipcode: fields['zipcode'],
                coord: [fields['coordx'], fields['coordy']]
            },
            owner: req.session.user_name
        }
        if (files.photo.size > 0) {
            var path = files.photo.path
            var type = files.photo.type
            FormHandle.photo(path, type)
                .then(({ data, type }) => {
                    restaurant['photo'] = new Buffer(data).toString('base64')
                    restaurant['photo_mimetype'] = type
                    resolve(restaurant)
                }).catch(() => {
                    throw new Error('Parse photo failed!')
                })
        } else {
            resolve(restaurant)
        }
    })
}
