const Express = require('express')
const app = Express()
const session = require('cookie-session')
const HomepageHandle = require('./page_handles/sample_homepage')

global.redirectionError = {
    status: 404,
    title: '404 not found!',
    contents: 'The page you requested does not exist!'
}

app.set('view engine', 'ejs')
app.use('/css', Express.static('css'))
app.use(session({
    user_name: '',
    keys: ['secret keys']
}))
// set routes
app.get('/', function (req, res) {
    HomepageHandle.homepage(req, res)
})

app.get('/error', function (req, res) {
    res.status(global.redirectionError.status)
    res.render('redirection_error_template')
})

app.get(/(^create)*/, function (req, res) {
    res.redirect('/error')
})
app.listen(process.env.PORT || 8099)