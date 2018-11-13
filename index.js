const Express = require('express')
const app = Express()
const HomepageHandle = require('./page_handles/sample_homepage')

app.set('view engine', 'ejs')
app.use('/css',Express.static('css'))

// set routes
app.get('/', function (req, res) {
    HomepageHandle.homepage(req,res)
})

app.listen(process.env.PORT || 8099)