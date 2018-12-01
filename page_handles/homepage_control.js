const http = require('http')
const Express = require('express')

const Homepage = {
    homepage: function (req, res) {
        if (req && res) {
            var user_name = req.session.user_name
            var context = []
            if (!user_name) context.push({ content: 'you have not logged in.' })
            else context.push({ content: `welcome! ${user_name}` })
            res.render('homepage_template',
                {
                    user_name,
                    title: 'Welcome',
                    context,
                    mapData: '',
                    pages: '',
                    curPage: '',
                    user_name: req.session.user_name,
                    isRated:''
                })
        }
    }

}
module.exports = Homepage