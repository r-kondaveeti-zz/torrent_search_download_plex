import React from 'react';
import Axios from 'axios';

import { Card } from './Card';

export class Main extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            movies: [],
            loader: true,
            query : '',
            onPlex: false
        }
        this.movies('')
    }

    movies = (movieName) => {
        this.state.loader = false
        var query = 'http://173.28.18.61:9000/search/'+encodeURIComponent(movieName)
        if (movieName === '') { query = 'http://173.28.18.61:9000/search/empty' }
        Axios.get(query)
        .then(
            resp => {
                console.log(resp)
                if (resp.data.name === 'diot') {
                    alert('Movie not available. Please check the spelling and try again!')
                }                         // <----- Means the entered query is invalid  as it has no output from Yify
                else { 
                    this.setState({
                        movies: resp.data
                    })
                    console.log(resp)
                    if (this.state.movies === undefined) { this.setState({loader: true}) }
                }
            }
        )

    }
    
    onSubmit = (event) => {
        this.movies(this.state.query)
    }

    onKeyDown = event => {
        // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
        if (event.key === 'Enter') {
          event.preventDefault();
          event.stopPropagation();
          this.onSubmit();
        }
      }
    onChange = (event) => {
        this.setState({query: event.target.value})
        // this.movies(event.target.value)
    }

    didLoad(didItLoad) {
        if(didItLoad) {
            return (
                <div class="progress">
                     <div class="determinate" style={{width: '100%'}}></div>
                </div>
            )
        }
        return (
            <div class="progress">
                 <div class="indeterminate"></div>
            </div>
        )
    }

    render() {

        var searchedMovies = ''

        if(this.state.movies !== undefined ) {
            searchedMovies = this.state.movies.map((element)=> {
                this.state.loader = true                                //IMPROV: <---- Not a good practice
                this.state.onPlex = element.onPlex                     //IMPROV: <---- Not a good practice
                return(<Card key={Math.random()} rating={element.rating} onPlex={this.state.onPlex} genre={element.genres} torrent={element.torrents}language={element.language} synopsis={element.synopsis} title={element.title} image={element.large_cover_image} heading={element.title} year={element.year}/>)
            })
            if (searchedMovies === '') this.state.loader = false
        }

        return(
        <div>
            <nav>
                <div className="nav-wrapper">
                    <form onSubmit={this.onSubmit} >
                        <div className="input-field teal lighten-2">
                        <input id="search" type="search" onKeyDown={this.onKeyDown} placeholder="Search movies" style={{'fontStyle': 'oblique', 'fontWeight': 'normal'}} onChange={this.onChange} required />
                        <label className="label-icon" htmlFor="search"><i className="material-icons">search</i></label>
                        <i className="material-icons">close</i>
                        </div>
                    </form>
                        { this.didLoad(this.state.loader) }
                </div>
            </nav>
            <br/>
            <div className="container">
                <div className="row">
                    { searchedMovies }
                </div>
            </div>
        </div>
        )
    }
}