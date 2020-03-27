import React from 'react';
import fetch from 'node-fetch';
import io from 'socket.io-client';

export class Card extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            downloading: [         //Array of downloading movie objects
                {
                    torrentId: ''
                }
            ],
            progressBar: 0,
            status: 'Download',
            vuzeId: 0,
            socket: null,
            title: '',
            onPlex: false
        }
    }

    componentDidMount() {
        this.setState({onPlex: this.props.onPlex})
        const socket = io('http://173.28.18.61:9000')
        this.setState({socket: socket})
        socket.on('allTorrentStaus', (res) => {
            // this.setState({ status: 'Downloading'})                              //For unusually movie names
            if (res != undefined) {
                res.status.forEach(element => {   
                    element.name = element.name.toUpperCase();
                    const upperCaseTitleProps = this.props.title.toUpperCase();  
                    if (element.name.includes(upperCaseTitleProps) ) {  
                        console.log('Movie Name matched! '+element)               //Found the movie-card  //IMPROV: If the download is done change the status to - on plex
                         this.setState({    
                              status: 'Downloading',
                              progressBar: element.percentDone
                            });
                            console.log(this.state.progressBar+ ' prograss baaar')
                            if(this.state.progressBar >= 97.9) { 
                                console.log('Movie Downloaded')
                                this.setState({onPlex: true})
                                socket.emit('refreshPlex');
                             }       
                        }
                });
            }
        })
    }


    downloadMovie = (magnet) => {
        const movieItem = {
            title: this.props.heading,
            magnet: magnet
        }
        this.state.socket.emit('startDownload', movieItem)
    }

    render() {
        var genre = '' //Movie genres
        if (this.props.genre !== undefined) {
            this.props.genre.map((element) => {
                genre = genre + ' ' + element
            })
        }

        var torrent = ""
        this.props.torrent.map((element) => {
            if(element.quality === '1080p'){
                torrent = element.url
                return 
            } 
            torrent = element.url
            return 
        })
        
        return(
            <div className="col s12 m4 l4 ">
                <div className="card">
                <div className="card-image">
                    <img src={ this.props.image } alt="Here is a card"/>
                </div>
                <div className="card-content">
                    <h6 style={{height: 40, overflow: 'scroll'}}><strong style={{ fontWeight: 'bolder'}}>{ this.props.heading }</strong></h6>
                    <p style={{ height: 150, overflow: 'scroll'}}>{ this.props.synopsis }</p>
                    <br />
                    <strong>IMDB: { this.props.rating }</strong><i className="material-icons right">stars</i>
                    <p><strong>Year: </strong> { this.props.year }</p>
                    <p><strong>Language: </strong> { this.props.language }</p>
                    <p style={{height: 40, overflow: 'scroll'}}><strong>Genre: </strong> { genre }</p>
                </div>
                <div className="card-action">
        <a className="waves-effect waves-light btn-small" target="_blank" href={this.state.onPlex ? 'http://app.plex.tv':null} onClick={this.state.onPlex ? null:() => {this.downloadMovie(torrent)}}><i className="material-icons right">{this.state.onPlex ? null:'cloud_download'}</i>{this.state.onPlex ? 'On Plex':this.state.status}</a>
                </div>
                <div className="progress">
                    <div className="determinate" style={{width: this.state.onPlex ? '100%':this.state.progressBar+'%'}}></div>
                </div>
                </div>
            </div>
        );
    }
}