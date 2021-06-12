const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb+srv://Robert:passwordSegura20@first-cluster.s2e70.mongodb.net/ecomerce?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
    .then((client) => {
      console.log("Connected successfully");
      _db = client.db();
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
  
};

const getDb = () => {
  if(_db) {
    return _db
  }
  throw "No database found yet"
}
exports.mongoConnect = mongoConnect;
exports.getDb = getDb
