//Movies on Plex to Mongo, i.e,  downloaded movies --> Done
//Integrate Yify API call from front end to node --> Done
    //Add a new field { onPlex: true } if the movie is in mongo and send the response --> Done
//Add the download button functionality --> Doing
//Integrate the download status functionality 

const express = require('express');
const database = require('./database.js')
const app = express();
const fetch = require('node-fetch');
var cors = require('cors')

var available = false

var corsOptions = {
    origin: 'http://173.28.18.61:3000',
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions))

//Lists searched the movies
app.get('/search/:name', function (req, res) {
    console.log('got the request')
    searchYify(decodeURI(''), res)
});

//Lists all the movies
app.get('/:name', function (req, res) {
    console.log('got the request')
    searchYify(decodeURI(req.params.name), res)
});

//To start the torrent and download it
app.get('/torrent/download/:magnet', (req, res) => {
    let magnet = req.params.magnet
    let buff = new Buffer(magnet, 'base64');
    magnet = buff.toString('ascii');
    console.log(req.params.magnet)
    startDownload(magnet, res)
})

//To check the status
app.get('/torrent/checkstatus/:magnet', (req, res) => {

})

//To list all the movies available on Plex
app.get('/torrent/listmovies/', (req, res) => {

})

//Stop movie download
// app.get('/torrent/stop/:name', (req, res) => { //Work on stop movie part TOMORROW -----------
//     stopDownload(id)
// })

//Start movie download
const startDownload = (magnet, res) => {
    fetch('http://vuze:WU98GJ34@173.28.18.61:9091/vuze/rpc?json={"method":"torrent-add","arguments":{"filename":"'+magnet+'"}}', { method: 'post', headers: {
        'Content-Type': 'application/json', 
       }})
    .then(res => res.json())
    .then(json => { res.send(JSON.stringify(json)); });
    
    //If the status reaches 1.0, the movie should be stopped.  --> Doing
       //Need to loop in a timely fashion --setInterval
    
    
    //If a movie takes more than 4 hours, it should be stopped. 

    
    //If a movie is not responding, it should be stopped. 
    
}

//Start downloading a stopped movie
const startMovieDownload = (id) => {
    console.log('stopping torrent')
    fetch('http://vuze:WU98GJ34@173.28.18.61:9091/vuze/rpc?json={"method":"torrent-start","arguments":{"ids":'+id+'}}', { method: 'post', headers: {
        'Content-Type': 'application/json', 
       }})
    .then(res => res.json())
    // .then(json => res.send(JSON.stringify(json)));
    .then(res => console.log(res))
}

//Stop movie download
const stopDownload = (id) => {
    console.log('stopping torrent')
    fetch('http://vuze:WU98GJ34@173.28.18.61:9091/vuze/rpc?json={"method":"torrent-stop","arguments":{"ids":'+id+'}}', { method: 'post', headers: {
        'Content-Type': 'application/json', 
       }})
    .then(res => res.json())
    // .then(json => res.send(JSON.stringify(json)));
    .then(res => console.log(res))
}

//Check the status
const checkStatus = (callback) => {
    const retValue = ''
    fetch('http://vuze:WU98GJ34@173.28.18.61:9091/vuze/rpc?json={"method":"torrent-get","arguments":{"fields":["id","name","status","sizeWhenDone","downloadedBytes","downloadedEver","eta","doneDate","isFinished","isStalled","percentDone","rateDownload"]}}', { method: 'get', headers: {
        'Content-Type': 'application/json', 
       }})
    .then(res => res.json())
    .then(json => console.log(callback(json.arguments.torrents)));
}

//Checks if a movie is on Plex
isOnPlex = async name => {
    let db = await database.makeConnection()
    let result = await database.findElements(db, { name: {$regex: name} })
    return new Promise((resolve, reject) => {
        if(result !== null) { available = true; console.log('aAva --'+ available); resolve(); }
    })
}

//Saves on Mongo 
// saveOnMongo = async () => {
//     let db = await database.makeConnection()
//     await db.insertIntoCollection(db, movie)
// }

//Searches yify and the mongo and gives back the result
searchYify = async (movieName, response) => {
    let yifyMovies = []
    let movies = []
    let searchYify = 'https://yts.mx/api/v2/list_movies.json?query_term='+movieName;
    fetch(searchYify, { method: 'get', headers: {
        'Content-Type': 'application/json', 
       }})
       .then(res => res.json())
       .then(json => {
           yifyMovies = json.data.movies;
           json.data.movies.forEach(element => {
            database.makeConnection().then(db => {
                database.findElements(db, { name: {$regex: element.title} })
                    .then(result => {
                            if (result != null) { 
                                console.log('---- movie on plex  ----')
                                element.onPlex = true
                                movies.push(element)
                            } else {
                                element.onPlex = false
                                movies.push(element)
                                console.log('---- movie NOT on plex ----')
                            }
                            if(yifyMovies.length == movies.length) { console.log(movies); response.send(movies) }
                        })
                    })  
           });   
        }).catch(err => console.log('Didnt receive any reponse from YIFY'))
}

//Server running on port number 9000
app.listen(9000)
// checkStatus(res => {
//     console.log(res)
// })
// insert = async (items)=> {
//     let db = await database.makeConnection()
//     await database.insertIntoCollection(db, items)
//     // await database.findAllMovies(db)
// }
// stopDownload(71)
// isOnPlex('Knives Out')

// insert()
// 



