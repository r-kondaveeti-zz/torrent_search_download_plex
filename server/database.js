let MongoClient = require('mongodb').MongoClient;
let url = 'mongodb://localhost:27017';

//Make connection
makeConnection = () => { 
  let database;
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
      database = db
      if (err) reject(err);
      console.log('Connected!')
      resolve(database)
    });
  })
}

//Insert
insertIntoCollection = (db, movie) => {
  return new Promise((resolve, reject) => {
    let dbo = db.db('movie-downloader');
    dbo.collection('movies').insertOne(movie, (err, res) => {
      if (err) throw err;
      console.log(res +" <---------  document inserted");
      db.close();
    })
  })
}

//Select or find the desired document
findElements = (db, movie) => {
  return new Promise((resolve, reject) => {
    let dbo = db.db('movie-downloader');
      dbo.collection('movies').findOne(movie, (err, result) => {
        if (err) throw err;
        resolve(result)
        db.close();
      })
  })
}

findAllMovies = (db, collection) => {
  return new Promise((resolve, reject) => {
    let dbo = db.db('movie-downloader');
      dbo.collection(collection).find({}).toArray((err, result) => {
        if (err) throw err;
        resolve(result)
        db.close();
      })
  })
}

// test = async () => {
// let db = await makeConnection()
// await findAllMovies(db, [])
// }

// test()

module.exports = {
    makeConnection,
    // insertIntoCollection,
    // findElements,
    findAllMovies
}


