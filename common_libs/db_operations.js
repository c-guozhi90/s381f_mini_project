const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
const mongoURL = 'mongodb://Raven_Jason:s381fminiproject.@ds155653.mlab.com:55653/mini_project_database'
const defaultCollection = 'restaurants'

const db_operations = {
    /**
     * connet to mongodb
     * @param {function(MongoClient)} callback Optional, pass in a callback function for subsequent database operations, default value will be empty string
     * @throws mongodb errors
     */
    connectDB: function (callback = '') {
        MongoClient.connect(mongoURL, function (err, db) {
            try {
                assert.equal(err, null)
                console.log('conneted to mongodb')
                if (typeof callback === 'function') {
                    callback(db)
                }
                db.close()
                console.log('disconneted to mongodb')
            } catch (err) {
                console.log(err)
                throw new Error('Connot connect to database!')
            }
        })
    },
    /**
     * Find specified records in mongodb
     * @param {object} keyValuePair Compulsary, key-value pairs to be searched, can be one pair or many
     * @param {function(array)} callback Compulsary, callback function for subsequent operations
     * @param {object} projection Optional, projection of the result set
     * @param {number} limit Optional, set the limit for the results.Set to nagetive number if it is unlimited
     * @param {string} collection Optional, set the collection name
     * @throws mongodb exception
     */
    findDB: function (keyValuePair, callback, projection = {}, limit, collection = defaultCollection) {
        this.connectDB(function (db) {
            var cursor
            var resultSet = []
            if (limit) {
                cursor = db.collection(collection).find(keyValuePair, projection).limit(limit)
            } else {
                cursor = db.collection(collection).find(keyValuePair, projection)
            }
            try {
                cursor.each(function (err, record) {
                    if (err) {
                        throw err;
                    } else if (record) {
                        resultSet.push(record)
                    } else {
                        callback(resultSet)
                    }
                })
            } catch (err) {
                console.log(err)
                throw new Error('Enquiry error! Try again')
            }
        })
    },
    /**
     * Insert data into mongodb
     * @param {object} dataObject Compulsory, the object to be inserted
     * @param {function(string,object)} callback Compulsory, callback function for subsequent operations
     * @param {string} collection Optional, set the collection name
     * @throws mongodb errors
     */
    insertDB: function (dataObject, collection = defaultCollection) {
        this.connectDB(function (db) {
            try {
                db.collection(collection).insertOne(dataObject, function (err, results) {
                    if (err) throw err
                    callback(results)
                })
            } catch (err) {
                console.log(err)
                throw new Error('Insertion error! Try again')
            }
        })
    },
    /**
     * Delete records in mongodb
     * @param {object} conditions Compulsary, specify the conditions for data deletion
     * @param {function(object)} callback Compulsary, callback function for subsequent operations
     * @param {boolean} many Optional, delete more than one record or not
     * @param {string} collection Optional, set the collection name
     * @throws mongodb errors
     */
    deleteDB: function (conditions, callback, many, collection = defaultCollection) {
        this.connectDB(function (db) {
            try {
                if (many) {
                    db.collection(collection).deleteMany(conditions, function (err, results) {
                        if (err) throw err
                        callback(results)
                    })
                } else {
                    db.collection(collection).deleteOne(conditions, function (err, results) {
                        if (err) throw err
                        callback(results)
                    })
                }
            } catch (err) {
                console.log(err)
                throw new Error('Deletion error! Nothing changed Try again')
            }
        })
    },
    /**
     * Update records in mongodb
     * @param {object} conditions Compulsary, specify the conditions for data update
     * @param {function(object)} callback Compulsary, callback function for subsequent operations
     * @param {boolean} many Optional, update more than one record or not
     * @param {string} collection Optional, set the collection name
     * @throws mongodb errors
     */
    updateDB: function (conditions, callback, many, collection = defaultCollection) {
        this.connectDB(function (db) {
            try {
                if (many) {
                    db.collection(collection).updateMany(conditions, function (err, results) {
                        if (err) throw err
                        callback(results)
                    })
                } else {
                    db.collection(collection).updateOne(conditions, function (err, results) {
                        if (err) throw err
                        callback(results)
                    })
                }
            } catch (err) {
                console.log(err)
                throw new Error('Update error! Try again')
            }
        })
    }
}

module.exports = db_operations