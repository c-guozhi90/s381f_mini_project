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
        res.render('restaurant_form_template',
            {
                create: true,
                user_name: req.session.user_name
            })
    },
    create: function (req, res) {
        if (!req.session.user_name || !req.session.user_id) {
            res.status(300).redirect('/account/login')
        }

        FormHandle.form(req)
            .then(({ fields, files }) => {
                return assign(req, fields, files, false)
            }).then(restaurant => {
                DBOperation.insertDB(restaurant)
                    .then(result => {
                        console.log(result.insertedCount + ' document inserted')
                        res.render('success_message_template', context =
                            {
                                title: 'Operation succeed',
                                message: 'Create restaurant successfully! click <a href="/account/home/1">here</a> back to your homepage'
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
        if (!req.params._id) {
            wrongMessage(404, res, new Error('Empty id!'))
            return
        }

        var owner = req.session.user_name
        var _id = ObjectId(req.params._id)
        DBOperation.findDB({ _id, owner })
            .then(resultset => {
                if (resultset.length && req.method == 'GET') {
                    res.status(200).render('restaurant_form_template',
                        {
                            user_name: req.session.user_name,
                            context: resultset[0],
                            create: false,
                            update: true,
                        })
                } else if (resultset.length && req.method == 'POST') {
                    return FormHandle.form(req)
                } else {
                    throw new Error('no such restaurant!')
                }
            })
            .then(({ fields, files }) => {
                return assign(req, fields, files, false)
            })
            .then(restaurant => {
                DBOperation.updateDB({ _id }, { $set: restaurant })
                    .then(result => {
                        console.log(`user updated ${result.modifiedCount} record(s)`)
                        res.status(200).render('success_message_template', context =
                            {
                                title: 'update succeeded',
                                message: 'you have successfully updated your restaurant, click <a href=/account/home/1>here</a> back to your homepage'
                            })
                    })
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
        if (!req.params._id) {
            wrongMessage(404, res, new Error('Empty id!'))
            return
        }

        var owner = req.session.user_name
        var _id = ObjectId(req.params._id)
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
        if (!req.params._id) {
            wrongMessage(404, res, new Error('Empty id!'))
            return
        }
        var _id = ObjectId(req.params._id)
        DBOperation.findDB({ _id })
            .then(resultset => {
                if (!resultset.length) throw new Error('no such restaurant!')
                var context = []
                var object = {}
                var isRated = false
                var lat = '', lon = ''
                object['grades']=[]
                for (prop in resultset[0]) {
                    if (prop == 'address') {
                        object['address']={}
                        for (prop in resultset[0]['address']) {
                            if (prop == 'coord') {
                                lat = resultset[0]['address']['coord'][0]
                                lon = resultset[0]['address']['coord'][1]
                            } else {
                                object['address'][prop] = `<b>${prop}</b>: ${resultset[0]['address'][prop]}`
                            }
                        }
                    }
                    else if (prop == 'grades') {
                        for (idx in resultset[0]['grades']) {
                            object['grades'].push(
                                {
                                    content: `<b>user</b>: ${resultset[0]['grades'][idx]['user']} <b>rate</b>: ${resultset[0]['grades'][idx]['score']}`
                                }
                            )
                            if (resultset[0]['grades'][idx]['user'] == req.session.user_name)
                                isRated = true
                        }
                    }
                    else if (prop != 'photo' && prop != 'photo_mimetype')
                        object[prop] = `<b>${prop}</b>: ${resultset[0][prop]}`
                    else if (prop == 'photo')
                        object[prop] = `data: ${resultset[0]['photo_mimetype']}; base64,${resultset[0]['photo']}`
                }
                context.push(object)
                res.status(200).render('homepage_template',
                    {
                        title: `${resultset[0]['name']}`,
                        user_name: req.session.user_name,
                        context,
                        pages: '',
                        curPage: '',
                        mapData: {
                            restaurant_name: `${resultset[0]['name']}`,
                            zoom: 18,
                            lat,
                            lon
                        },
                        isRated
                    })
            })
            .catch(err => {
                wrongMessage(404, res, err)
            })
    },
    search: function (req, res) {
        // render results from session
        if (req.method == 'GET' && req.session.hasOwnProperty(searchResults)) {
            res.status(200).render('homepage_template.ejs', contents(req.session.searchResults, req.session.user_name, req.params.page))
            return
        }
        FormHandle.form(req)
            .then(({ fields, files }) => {
                return assign(req, fields, files, true)
            })
            .then(restaurant => {
                console.log(restaurant)
                return DBOperation.findDB(restaurant, { _id: 1, name: 1 }, 100000)
                    .catch(err => {
                        throw new Error('something went wrong!')
                    })
            })
            .then(resultSet => {
                req.session.searchResults = resultSet
                res.status(200).render('homepage_template.ejs', contents(req.session.searchResults, req.session.user_name, 1))
            })
            .catch(err => {
                wrongMessage(500, res, err)
            })
    },
    searchForm: function (req, res) {
        res.status(200).render('restaurant_form_template',
            {
                user_name: req.session.user_name,
                create: false,
                update: false
            })
    },
    rate: function (req, res) {
        if (!req.session.user_name && !req.session.user_id) {
            res.status(300).redirect('/account/login')
            return
        }
        var score = req.query.score
        var _id = ObjectId(req.params._id)
        var user = req.session.user_name
        DBOperation.findDB({ _id })
            .then(() => {
                return DBOperation.updateDB({ _id }, { $push: { grades: { user, score } } })
                    .then(results => {
                        console.log(`user rate ${results.modifiedCount} record(s)`)
                    })
            })
            .then(() => {
                res.status(200).render('success_message_template', context =
                    {
                        title: 'rate succeeded',
                        message: `You have rated a restaurant, click <a href="/restaurant/${req.params._id}">here</a> to the restaurant page`
                    })
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
function assign(req, fields, files, search) {
    return new Promise((resolve, reject) => {
        if (!fields['name'] && !search) {
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
            },
            owner: req.session.user_name
        }
        if (fields['coordx'] && fields['coordy'])
            restaurant['address']['coord'] = [+fields['coordx'], +fields['coordy']]
        if (search) {
            restaurant['owner'] = fields['owner']
        }

        for (prop in restaurant) {
            if (!restaurant[prop]) delete restaurant[prop]
        }
        for (prop in restaurant['address']) {
            if (!restaurant['address'][prop]) delete restaurant['address'][prop]
        }
        if (Object.keys(restaurant['address']).length == 0)
            delete restaurant['address']
        if (Object.keys(files).length && files.photo.size > 0) {
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
function contents(resultSet, user_name, page) {
    var context = []
    var pages = []
    if (resultSet.length) {
        for (i = 0; i < 20 && 20 * (page - 1) + i < resultSet.length; i++) {
            var _id = resultSet[20 * (page - 1) + i]['_id']
            var name = resultSet[20 * (page - 1) + i]['name']
            context.push({ restautant: `<a href="/restaurant/${_id}">${name}</a>` })
        }
        for (i = 1; i <= Math.floor(resultSet.length / 20) + 1; i++) {
            pages.push({ link: `/restaurant/search/result/${i}` })
        }
    } else {
        context.push({ restaurant: 'No restaurants shown.' })
    }
    var content = {
        context,
        pages: pages,
        title: 'search results',
        curPage: page,
        user_name,
        mapData: {},
        isRated: true
    }
    return content
}
