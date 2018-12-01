const Express = require('express')
const app = Express()
const session = require('cookie-session')
const HomepageHandle = require('./page_handles/homepage_control')
const UserHandle = require('./page_handles/account_control')
const restaurantHandle = require('./page_handles/restaurant_control')

global.redirectionError = {
    status: 404,
    title: '404 not found!',
    contents: 'The page you requested does not exist!'
}

app.set('view engine', 'ejs')
app.use('/css', Express.static('css'))
app.use(session({
    user_id: '',
    user_name: '',
    keys: ['secret keys']
}))
// set routes
app.get('/', HomepageHandle.homepage)

app.route('/account/create').get(UserHandle.form).post(UserHandle.create)
app.get('/account/check', UserHandle.check)
app.route('/account/login').all(UserHandle.login)
app.get('/account/logout', UserHandle.logout)
app.get('/account/home/:page', UserHandle.home)

app.route('/restaurant/create').get(restaurantHandle.form).post(restaurantHandle.create)
app.route('/restaurant/update/:_id').all(restaurantHandle.update)
app.get('/restaurant/delete/:_id', restaurantHandle.delete)
app.get('/restaurant/:_id', restaurantHandle.detail)
app.post('/restaurant/search', restaurantHandle.search)
app.get('/restaurant/search/form', restaurantHandle.searchForm)

app.get('/error', function (req, res) {
    res.status(global.redirectionError.status)
    res.render('redirection_error_template')
})

app.use(function (req, res, next) {
    global.redirectionError = {
        status: 404,
        title: '404 not found!',
        contents: 'The page you requested does not exist!'
    }
    res.render('redirection_error_template')
})
app.listen(process.env.PORT || 3000)