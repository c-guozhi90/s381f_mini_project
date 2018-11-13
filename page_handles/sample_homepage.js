const http = require('http')
const Express = require('express')

const Homepage = {
    homepage: function (req, res) {
        if (req && res) {
            res.render('homepage_template')
        }
    }

}
module.exports = Homepage