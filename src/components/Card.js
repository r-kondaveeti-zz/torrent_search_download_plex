import React from 'react';
import Axios from 'axios'
export class Card extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            downloading: [         //Array of downloading movie objects
                {
                    torrentId: ''
                }
            ],
            status: 'Download'
        }
    }

    downloadMovie = (link) => {
        link = btoa(link)
        fetch('http://173.28.18.61:9000/torrent/download/'+link)
        .then(resp => {
            console.log(resp.json())
        }).then((data) => {
            console.log(data);
        });
    }

    render() {
        var genre = '' //Movie genres
        if (this.props.genre !== undefined) {
            this.props.genre.map((element) => {
                genre = genre + ' ' + element
            })
        }

        var torrent = ""
        console.log(torrent)
        this.props.torrent.map((element) => {
            if(element.quality === '1080p'){
                torrent = element.url
                console.log('clicked!')
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
        <a className="waves-effect waves-light btn-small" target="_blank" href={this.props.onPlex ? 'http://app.plex.tv':null} onClick={this.props.onPlex ? null:() => {this.downloadMovie(torrent)}}><i className="material-icons right">{this.props.onPlex ? null:'cloud_download'}</i>{this.props.onPlex ? 'On Plex':'Download'}</a>
                </div>
                <div className="progress">
                    <div className="determinate" style={{width: 0}}></div>
                </div>
                </div>
            </div>
        );
    }
}