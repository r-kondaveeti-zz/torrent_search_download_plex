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
            onPlex: false,
            buttonEffect: "waves-effect waves-light btn-small",
            speed: '',
            eta: ''
        }
    }

    componentDidMount() {
        this.setState({onPlex: this.props.onPlex})
        const socket = io('http://173.28.18.61:9000')
        this.setState({socket: socket})
        socket.on('allTorrentStaus', (res) => {
            // this.setState({ status: 'Downloading'})                              //For unusually movie names
            if (res != undefined) {
                console.log(res)
                res.status.forEach(element => {   

                    this.setState({ vuzeId: element.id })
                    console.log("Vuze ID is "+this.state.vuzeId)
                    /* The below 4 lines are for string comparision of titles */
                    element.name = element.name.replace(/[^0-9a-z]/gi, '');        
                    let propsTitle = this.props.title.replace(/[^0-9a-z]/gi, '');
                    element.name = element.name.toUpperCase();
                    const upperCaseTitleProps = propsTitle.toUpperCase(); 
                    console.log(element.name+ "Element Title") 
                    console.log(upperCaseTitleProps+" Props title")
                    if (element.name.includes(upperCaseTitleProps) ) {  
                        console.log('Movie Name matched! '+element)               //Found the movie-card  //IMPROV: If the download is done change the status to - on plex
                         this.setState({    
                              status: 'Stop',
                              progressBar: element.percentDone,
                              speed: 'Speed:'+element.rateDownload+' | ',
                              eta: 'ETA:'+element.eta
                            });
                            console.log(this.state.progressBar+ ' prograss baaar')
                            if(this.state.progressBar >= 97.9) { 
                                console.log('Movie Downloaded')
                                this.setState({onPlex: true})
                                socket.emit('refreshPlex');
                             }       
                         } //else if (!this.state.onPlex && !element.name.includes(upperCaseTitleProps)) { //When the user presses stop
                        //     this.setState({status: 'Download', progressBar: 0})                         //the status has to set to 0
                        // }
                });
            }
            if (this.state.status !== "Download" && !this.state.onPlex) {
                this.setState({buttonEffect: "waves-effect waves-light btn-small pulse red lighten-2"})
            } else { this.setState({buttonEffect: "waves-effect waves-light btn-small"})}
        })
        socket.on('stoppedDownload', res => {
            this.setState({buttonEffect: "waves-effect waves-light btn-small", status: "Download", progressBar: 0, speed: '', eta: ''})
            console.log(res + ' Stopped DOWNALODING')
        })
    }


    downloadMovie = (magnet) => {
        if(this.state.status === "Download") {
            const movieItem = {
                title: this.props.heading,
                magnet: magnet
            }
            this.state.socket.emit('startDownload', movieItem)
        }

        // let something = this.props.heading.replace(/[^0-9a-z]/gi, ''); 
        // console.log(something)
        if(this.state.status === "Stop") {
            console.log('pressed stop')
            this.state.socket.emit('stopDownload', this.state.vuzeId)
        }
    }

    render() {
        var genre = '' //Movie genres
        if (this.props.genre !== undefined) {
            this.props.genre.map((element) => {
                genre = genre + ' ' + element
            })
        }

        if (this.props.torrent !== undefined) {
            var torrent = " "
            if(typeof this.props.torrent === typeof []) {     //Making sure torrents property of json is array
                // console.log('Torrents are an array ')
                    this.props.torrent.map((element) => {
                    if(element.quality === '1080p'){
                        torrent = element.url
                        return 
                    } 
                    torrent = element.url
                    return 
                })
            }
    
            if(typeof this.props.torrent === typeof 'string') {    //Desi movies have only 1 torrent link, which has to be strings
                torrent = this.props.torrent;
            }
        }
        
        
        return(
            <div className="col s6 m4 l4 ">
                <div className="card">
                <div className="card-image">
                    <img src={ this.props.image } alt={this.props.title}/>
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
        <a class={this.state.buttonEffect} target="_blank" href={this.state.onPlex ? 'http://app.plex.tv':null} onClick={this.state.onPlex ? null:() => {this.downloadMovie(torrent)}}><i className="material-icons right">{this.state.onPlex ? null:'cloud_download'}</i>{this.state.onPlex ? 'On Plex':this.state.status}</a><span class="badge">{ this.state.onPlex ? null:<strong>{this.state.speed+' '+this.state.eta}</strong> }</span>
        {/* <br/>
        <br/> */}
                </div>
                <div className="progress">
                    <div className="determinate" style={{width: this.state.onPlex ? '100%':this.state.progressBar+'%'}}></div>
                </div>
                </div>
            </div>
        );
    }
}