const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
const mongoURL = 'mongodb://Raven_Jason:s381fminiproject.@ds155653.mlab.com:55653/mini_project_database'
const defaultCollection = 'restaurants'

const db_operations = {
    /**
     * connet to mongodb
     * @param {function} callback Optional, pass in a callback function for subsequent database operations, default value will be empty string
     */
    connectDB: function (callback = '') {
        MongoClient.connect(mongoURL, function (err, db) {
            assert.equal(err, null)
            console.log('conneted to mongodb')
            if (typeof callback === 'function') {
                callback(db)
            }
            db.close()
            console.log('disconneted to mongodb')
        })
    },
    /**
     * Find specified records in mongodb
     * @param {object} keyValuePair Compulsary, key-value pairs to be searched, can be one pair or many
     * @param {function} callback Compulsary, callback function for subsequent operations
     * @param {object} projection Optional, projection of the result set
     * @param {number} limit Optional, set the limit for the results.Set to nagetive number if it is unlimited
     * @param {string} collection Optional, set the collection name
     */
    findDB: function (keyValuePair, callback, projection = {}, limit, collection = defaultCollection) {
        this.connectDB(function (db) {
            var cursor
            var resultSet = {}
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
            }
        })
    },
    /**
     * Insert data into mongodb
     * @param {object} dataObject Compulsory, the object to be inserted
     * @param {string} collection Optional, set the collection name
     */
    insertDB: function (dataObject, collection = defaultCollection) {
        this.connectDB(function (db) {
            try {
                db.collection(collection).insertOne(dataObject, function(err,results){this.callback_result(err, results)})
            } catch (err) {
                console.log(err)
            }
        })
    },
    /**
     * Delete records in mongodb
     * @param {object} conditions Compulsary, specify the conditions for data deletion
     * @param {boolean} many Optional, delete more than one record or not
     * @param {string} collection Optional, set the collection name
     */
    deleteDB: function (conditions, many, collection = defaultCollection) {
        this.connectDB(function (db) {
            try {
                if (many) {
                    db.collection(collection).deleteMany(conditions, function(err,results){this.callback_result(err, results)})
                } else {
                    db.collection(collection).deleteOne(conditions, function(err,results){this.callback_result(err, results)})
                }
            } catch (err) {
                console.log(err)
            }
        })
    },
    /**
     * Update records in mongodb
     * @param {object} conditions Compulsary, specify the conditions for data update
     * @param {boolean} many Optional, update more than one record or not
     * @param {string} collection Optional, set the collection name
     */
    updateDB: function (conditions, many, collection = defaultCollection) {
        this.connectDB(function (db) {
            try {
                if (many) {
                    db.collection(collections).updateMany(conditions, function(err,results){this.callback_result(err, results)})
                } else {
                    db.collection(collections).updateOne(conditions, function(err,results){this.callback_result(err, results)})
                }
            } catch (err) {
                console.log(err)
            }
        })
    },
    /**
     * callback function for displaying results of data operations
     * @param {string} err error message
     * @param {string} results results after operations
     */
    callback_result: function (err, results) {
        if (err) {
            throw err
        } else {
            console.log(results)
        }
    }
}

module.exports = db_operations