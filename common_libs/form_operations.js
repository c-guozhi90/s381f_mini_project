const formidable = require('formidable')
const fs = require('fs')

const FormParse = {
    /**
     * parse form with promise
     * @param {string} req form query of Express
     */
    form: function (req) {
        return new Promise((resolve, reject) => {
            var form = new formidable.IncomingForm()
            form.parse(req, (err, fields, files) => {
                if (!err) {
                    resolve({ fields, files })
                } else {
                    reject(err)
                }
            })
        }).catch(err => {
            console.log(err)
        })
    },
    photo: function (path, type) {
        return new Promise((resolve, reject) => {
            if (path && type) {
                fs.readFile(path, (err, data) => {
                    if (!err) {
                        resolve({ data, type })
                    } else {
                        reject(err)
                    }
                })
            }
        }).catch(err => {
            console.log(err)
        })
    }
}
module.exports = FormParse