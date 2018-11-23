const formidable = require('formidable')
const fs = require('fs')
const DBOperation = require('../common_libs/db_operations')

const CreateRestaurant = {
    restaurant: {
        restaurant_id: '',
        name: '',
        borough: '',
        cuisine: '',
        photo: '',
        photo_mimetype: '',
        address: {
            street: '',
            building: '',
            zipcode: '',
            coord: []
        },
        owner: ''
    },
    form: function (req, res) {
        if (!req.session.user_name || !req.session.user_id) {
            res.status(300).redirect('/account/login')
            return
        }
        res.status(200)
        res.render('restaurant_form_template')
    },
    create: function (req, res) {
        if (!req.session.user_name || !req.session.user_id) {
            res.status(300).redirect('/account/login')
        }

        var form = new formidable.IncomingForm()
        form.parse(req, function (err, fields, files) {
            if (err) {
                wrongMessage(500, res, new Error('Form parse failed!'))
                return
            }
            console.log(fields)
            try {
                assign(fields, files)
                this.restaurant['owner'] = req.session['user_name']
                DBOperation.insertDB(this.restaurant)
                    .then(result => {
                        console.log(result.insertedCount + ' document inserted')
                        res.status(200).render('success_message_template',
                            context = {
                                title: 'Operation succeed',
                                message: 'Create restaurant successfully! click <a href="/account/home">here</a> back to your homepage'
                            })
                    }).catch(err => {
                        wrongMessage(500, res, new Error('Insertion failed!'))
                    })
            } catch (err) {
                wrongMessage(500, res, err)
            }
        })
    }
}
module.exports = CreateRestaurant
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
function assign(fields, files) {
    if (!fields['name']) throw new Error('Please input the restaurant name!')
    for (i = 0; i < 4; i++) {
        if (fields[i]) {
            this.restaurant[i] = fields[i]
        } else {
            delete this.restaurant[i]
        }
    }
    fields['coordx'] !== '' && fields['coordy'] !== '' ? this.restaurant['address']['coord'] = [fields['coord_x'], fields['coord_y']] : delete this.restaurant['address']['coord']
    fields.building != '' ? this.restaurant['street']['building'] = fields.building : delete this.restaurant['street']['building']
    fields.zipcode != '' ? this.restaurant['street']['zipcode'] = fields.zipcode : delete this.restaurant['street']['zipcode']

    if (files.fileupload.size > 0) {
        this.restaurant['photo_mimetype'] = files.fileupload.type
        var path = files.fileupload.path
        fs.readFile(path, function (err, data) {
            if (err) {
                wrongMessage(500, res, new Error('File upload failed!'))
                return
            }
            restaurant['photo'] = new Buffer(data).toString('base64')
        })
    } else {
        delete this.restaurant['photo']
        delete this.restaurant['photo_mimetype']
    }
}
