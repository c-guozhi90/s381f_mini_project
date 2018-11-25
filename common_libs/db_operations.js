const MongoClient = require('mongodb').MongoClient
const mongoURL = 'mongodb://Raven_Jason:s381fminiproject.@ds155653.mlab.com:55653/mini_project_database'
const defaultCollection = 'restaurants'

const DBOperations = {
    /**
     * connet to mongodb
     * @param {function(MongoClient)} callback Optional, pass in a callback function for subsequent database operations, default value will be empty string
     * @throws mongodb errors
     */
    connectDB: function () {
        return new Promise((resolve, reject) => {
            MongoClient.connect(mongoURL, (err, db) => {
                if (!err) {
                    console.log('conneted to mongodb')
                    resolve(db)
                    console.log('disconneted to mongodb')
                } else {
                    reject('Something went wrong!')
                }
            })
        })
    },
    /**
     * Find specified records in mongodb
     * @param {object} keyValuePair Compulsary, key-value pairs to be searched, can be one pair or many
     * @param {object} projection Optional, projection of the result set
     * @param {number} limit Optional, set the limit for the results, default value will be 1
     * @param {string} collection Optional, set the collection name
     */
    findDB: function (keyValuePair, projection = {}, limit = 1, collection = defaultCollection) {
        return new Promise((resolve, reject) => {
            this.connectDB()
                .then(db => {
                    var cursor
                    var resultSet = []
                    cursor = db.collection(collection).find(keyValuePair, projection).limit(limit)
                    cursor.each((err, record) => {
                        if (record) {
                            resultSet.push(record)
                        } else if (!err) {
                            resolve(resultSet)
                            db.close()
                        } else {
                            db.close()
                            reject(err)
                        }
                    })
                }).catch(err => { console.log(err) })
        }).catch(err => { console.log(err) })
    },
    /**
     * Insert data into mongodb
     * @param {object} dataObject Compulsory, the object to be inserted
     * @param {string} collection Optional, set the collection name
     */
    insertDB: function (dataObject, collection = defaultCollection) {
        return new Promise((resolve, reject) => {
            this.connectDB()
                .then(db => {
                    db.collection(collection).insertOne(dataObject, (err, results) => {
                        if (!err) resolve(results)
                        else reject(err)
                    })
                    db.close()
                }).catch(err => { console.log(err) })
        }).catch(err => { console.log(err) })
    },
    /**
     * Delete records in mongodb
     * @param {object} conditions Compulsary, specify the conditions for data deletion
     * @param {boolean} many Optional, delete more than one record or not
     * @param {string} collection Optional, set the collection name
     */
    deleteDB: function (conditions, many, collection = defaultCollection) {
        return new Promise((resolve, reject) => {
            this.connectDB()
                .then(db => {
                    if (many) {
                        db.collection(collection).deleteMany(conditions, function (err, results) {
                            if (!err) resolve(results)
                            else reject(err)
                        })
                    } else {
                        db.collection(collection).deleteOne(conditions, function (err, results) {
                            if (err) resolve(results)
                            else reject(err)
                        })
                    }
                    db.close()
                }).catch(err => { console.log(err) })
        }).catch(err => { console.log(err) })
    },
    /**
     * Update records in mongodb
     * @param {object} conditions Compulsary, specify the conditions for data update
     * @param {boolean} many Optional, update more than one record or not
     * @param {string} collection Optional, set the collection name
     */
    updateDB: function (conditions, many, collection = defaultCollection) {
        return new Promise((resolve, reject) => {
            this.connectDB()
                .then(db => {
                    if (many) {
                        db.collection(collection).updateMany(conditions, (err, results) => {
                            if (!err) resolve(results)
                            else reject(err)
                        })
                    } else {
                        db.collection(collection).updateOne(conditions, (err, results) => {
                            if (err) resolve(results)
                            else reject(err)
                        })
                    }
                    db.close()
                }).catch(err => { console.log(err) })
        }).catch(err => console.log(err))
    }
}

module.exports = DBOperations