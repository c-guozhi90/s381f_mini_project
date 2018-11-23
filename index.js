const Express = require('express')
const app = Express()
const session = require('cookie-session')
const HomepageHandle = require('./page_handles/sample_homepage')
const UserHandle = require('./page_handles/account_control')

global.redirectionError = {
    status: 404,
    title: '404 not found!',
    contents: 'The page you requested does not exist!'
}

app.set('view engine', 'ejs')
app.use('/css', Express.static('css'))
app.use(session({
    user_id:'',
    user_name: '',
    keys: ['secret keys']
}))
// set routes
app.get('/', HomepageHandle.homepage)

app.route('/account/create').get(UserHandle.form).post(UserHandle.create)
app.get('/account/check',UserHandle.check)

app.get('/error', function (req, res) {
    res.status(global.redirectionError.status)
    res.render('redirection_error_template')
})

app.get(/(^create)*/, function (req, res) {
    res.redirect('/error')
})
app.listen(process.env.PORT || 3000)