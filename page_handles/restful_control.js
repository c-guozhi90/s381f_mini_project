const DBOperation = require('../common_libs/db_operations')

const RESTful = {
    getInfo: function (req, res) {
        var toBeSearch = {}
        var prop = `${req.path}`.substring(21)
        prop = prop.substring(0, prop.indexOf(req.params.arg) - 1)
        toBeSearch[prop] = req.params.arg
        DBOperation.findDB(toBeSearch, { photo: 0 }, 100000)
            .then(resultSet => {
                if (resultSet.length)
                    res.status(200).send(resultSet)
                else
                    res.status(200).send({})
            }).catch(err => {
                console.log(err)
                res.status(200).send({})
            })
    },
    postData: function (req, res) {
        if (!req.body) {
            res.send({ status: 'failed' })
            return
        }
        var data = req.body
        var userid = '', password = ''
        if (data.hasOwnProperty('userid') && data.hasOwnProperty('password') && data.hasOwnProperty('name') && data['userid'] && data['password'] && data['name']) {
            userid = data['userid']
            password = data['password']
        } else {
            res.send({ status: "failed" })
            return
        }
        var restaurant = {
            restaurant_id: '',
            name: '',
            borough: '',
            cuisine: '',
            address: {
                street: '',
                building: '',
                zipcode: '',
                coord: ['', '']
            },
            photo: '',
            photo_mimetype: ''
        }
        for (prop in restaurant) {
            if (prop != 'address' && data.hasOwnProperty(prop) && data[prop]) {
                restaurant[prop] = data[prop]
            } else if (prop == 'address' && data.hasOwnProperty(prop) && Object.keys(data[prop]).length > 0) {
                for (prop in restaurant['address']) {
                    if (data['address'].hasOwnProperty(prop) && data['address'][prop]) {
                        restaurant['address'][prop] = data['address'][prop]
                    } else {
                        delete restaurant['address'][prop]
                    }
                }
            } else {
                delete restaurant[prop]
            }
        }
        DBOperation.findDB({ userid: userid, password: password }, {}, 1, 'users')
            .then(resultSet => {
                if (!resultSet.length) throw new Error()
                return resultSet[0].name
            })
            .then(owner => {
                restaurant['owner'] = owner
                DBOperation.insertDB(restaurant)
                    .then((results) => {
                        res.send({ status: "ok", _id: results.insertedId })
                    })
            })
            .catch(err => {
                res.send({ status: 'failed' })
            })
    }
}

module.exports = RESTful