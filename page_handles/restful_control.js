const DBOperation = require('../common_libs/db_operations')
const RESTful = {
    getInfo: function (req, res) {
        var toBeSearch = {}
        var prop = `${req.path}`.substring(21)
        prop = prop.substring(0, prop.indexOf(req.params.arg) - 1)
        toBeSearch[prop] = req.params.arg
        console.log(prop)
        console.log(req.params.arg)
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
        
    }
}
module.exports = RESTful