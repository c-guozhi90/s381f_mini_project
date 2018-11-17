const Express = require('express')
const app = Express()
const HomepageHandle = require('./page_handles/sample_homepage')
global.redirectionError = {
    status,
    title: '',
    contents: ''
}

app.set('view engine', 'ejs')
app.use('/css', Express.static('css'))

// set routes
app.get('/', function (req, res) {
    HomepageHandle.homepage(req, res)
})

app.get('/error', function (req, res) {
    res.status(status)
    res.render('redirection_error_template')
})
app.listen(process.env.PORT || 8099)