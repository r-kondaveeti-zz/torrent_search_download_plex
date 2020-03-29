const express = require('express');                                
const database = require('./database.js')
const app = express();          
const fetch = require('node-fetch');
const http = require('http')
const cors = require('cors')
const server = require('http').Server(app);
const io = require('socket.io')(server);
const EventEmitter = require('events')
const eventEmitter =  new EventEmitter()
const xml2js = require('xml2js');
const parser = new xml2js.Parser();

parser.on('error', function(err) { console.log('Parser error', err); });

//Cors 
var corsOptions = {
    origin: 'http://173.28.18.61:3000',
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions))

//Lists all the movies
app.get('/search/:name', function (req, res) {
    console.log('got the request')
    if(req.params.name === 'empty') { searchYify(decodeURI(''), res) }
    else { searchYify(decodeURI(req.params.name), res) }
});

//To start the torrent and download it
app.get('/torrent/download/:magnet', (req, res) => {
    let magnet = req.params.magnet
    let buff = new Buffer(magnet, 'base64');
    magnet = buff.toString('ascii');
    console.log(magnet)
    // eventEmitter.emit('startDownload', magnet)                                     <====== Stopped emitting
    res.send('Nice ')                                                               //IMPROV: Change the response]
})

//Checks if a movie is on Plex
isOnPlex = async name => {
    let db = await database.makeConnection()
    let result = await database.findElements(db, { name: {$regex: name} })
    return new Promise((resolve, reject) => {
        if(result !== null) { resolve(); }
    })
}

//Searches yify and Plex and gives back the result
searchYify = async (movieName, response) => {
    let searchYify = 'https://yts.mx/api/v2/list_movies.json?query_term='+movieName;
    fetch(searchYify, { method: 'get', headers: {
        'Content-Type': 'application/json', 
       }}).catch(err => console.log('Didnt receive any reponse from YIFY '+err))
       .then(res => res.json())
       .then(json => {
           console.log(json)
           if(json.data.movie_count == 0) { console.log('enter a valid movie'); response.send({name: 'diot'}) }
           else { 
                    queryPlex(json.data.movies, response, (movies, res) => {               
                    res.send(movies)                                                                            // <---------- Plex Result
                })
            }                                                   
        })
}

//Server running on port number 9000
server.listen(9000);

io.on('connection', (socket) => {
    console.log('Connected!')
    io.emit('this', { value: 'this'})

    socket.on('disconnect user', () => {
        console.log('Disconnected')
        io.emit('disconnected')
    })

    socket.emit('check-status')
    socket.on('all-torrent-status', res => {
        console.log(res)
        res.status.forEach(element => {
            if (element.percentDone > 99.0) {
                http.get('http://173.28.18.61:32400/library/sections/5/refresh?force=1&X-Plex-Token=rSGQyH4Q1ZxJNs-u9jf3', () => {
                console.log('Refreshed plex movie library')
                })
            }
        })
        io.emit('allTorrentStaus', res)                                                        //CUR: send all the downloads to the front - end 
    })

    //Dependencies - Magnet. Can be obtained from the client
    eventEmitter.on('startDownload', (magnet) => {
        socket.emit('start-download', magnet)
    })

    socket.on('started-download', res => {
        console.log('download has started, informing the client'+res)       //IMPROV: send res to client
        io.emit('startedDownload', res)
    })

    //Client
    socket.on('startDownload', (movieItem) => {    
        console.log('Client emitted startDownload')                                //CUR: <------- Client emits with a magnet link
        socket.broadcast.emit('start-download', movieItem)                         //CUR: Emit to Ninja and ninja starts the download               
    })

    //Refresh Plex 
    socket.on('refreshPlex', () => {
        http.get('http://173.28.18.61:32400/library/sections/5/refresh?force=1&X-Plex-Token=rSGQyH4Q1ZxJNs-u9jf3', () => {
            console.log('Refreshed plex movie library')
        })
    })
    
    //Dependencies - id of the movie. Can be obtained by querying Vuze (query can 
    //look up if the movies is being downloaded (status 4 and First 5 letters has to match the name))
    socket.on('stopDownload', id => {
        io.emit('stop-download', id)
        console.log('sending stop signal to Ninja '+id)
    })
    socket.on('stopped-download', res => {
        console.log('download has stopped! Informing the client '+res)
        socket.broadcast.emit('stoppedDownload', res)
    })
})

const queryPlex = async (yifyMovies, response, callback) => {
        let returnMovies= []
        let plexMovies = []
        var data = '';
        http.get('http://173.28.18.61:32400/library/sections/5/all?X-Plex-Token=rSGQyH4Q1ZxJNs-u9jf3', function(res) {
            if (res.statusCode >= 200 && res.statusCode < 400) {
                res.on('data', function(data_) { data += data_.toString(); });
                res.on('end', function() {
                    parser.parseString(data, function(err, result) {
                        plexMovies = result.MediaContainer.Video;                 // <-----  Plex movies result
                        yifyMovies.forEach(movieItem => {
                            for(index = 0; index < plexMovies.length; index++) {
                                let movieItemUpperCase = movieItem.title.toUpperCase()
                                let plexMoviesUpperCase = plexMovies[index].$.title.toUpperCase()
                                if (movieItemUpperCase === plexMoviesUpperCase) { movieItem.onPlex = true; break; }
                                else { movieItem.onPlex = false; }
                            }
                            returnMovies.push(movieItem)
                        })
                        callback(returnMovies, response)
                    });
                });
            }
        });
}




 