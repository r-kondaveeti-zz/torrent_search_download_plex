import React from 'react';
import Axios from 'axios';
import M from 'materialize-css'

import { Card } from './Card';

export class Main extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            movies: [],
            loader: true,
            query : '',
            onPlex: false,
            sideBar: null
        }
        this.movies('')
    }

    movies = (movieName) => {
        this.state.loader = false
        var query = 'http://localhost:9000/search/'+encodeURIComponent(movieName)
        if (movieName === '') { query = 'http://localhost:9000/search/empty' }
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

    componentDidMount = () => {
        const that = this
        document.addEventListener('DOMContentLoaded', function() {
            var elems = document.querySelectorAll('.sidenav');
            var instances = M.Sidenav.init(elems, {
                'edge': 'right'
            });
            that.setState({ sideBar: instances})
          })

        document.addEventListener('DOMContentLoaded', function() {
            var elems = document.querySelectorAll('.collapsible');
            var instance = M.Collapsible.init(elems, {});
        })
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
                <div>
                     {/* <div class="determinate" style={{width: '100%'}}></div> */}
                </div>
            )
        }
        return (
            <div class="progress" style={{'paddingTop': 0, 'marginTop': 0, 'borderTop': 0, 'paddingBottom': 0, 'marginBottom': 0, 'borderBottom': 0}}>
                 <div class="indeterminate"></div>
            </div>
        )
    }

    onClick = event => {
        const genreList = ['Action', 'Adventure', 'Comedy', 'Family', 'Fantasy', 'Horror', 'Sci-Fi', 'Thriller', 'Popular Downloads']
        let genreUrl = 'http://localhost:9000/genre/'
        genreList.forEach(element => {
            if(event.target.text === element) {
                let genreType = element
                this.state.loader = false
                genreType = encodeURI(genreType)
                genreUrl = genreUrl + genreType
                Axios.get(genreUrl)
                    .then(
                        resp => {
                            this.setState({
                                movies: resp.data
                            })
                            console.log(resp)
                            if (this.state.movies === undefined) { this.setState({loader: true}) }
                        }
                    ) 
            }
        })

        //Telugu
        if(event.target.text === 'Featurd Telugu') {
            Axios.get('http://localhost:9000/telugu/featured/')
                .then(response => {
                    console.log(response.data)
                    this.setState({movies: response.data})
                })
        }

        //Telugu
        if(event.target.text === 'Telugu Movies 2019') {
            Axios.get('http://localhost:9000/telugu/2019/')
                .then(response => {
                    console.log(response.data)
                    this.setState({movies: response.data})
                })
        }

        //Telugu
        if(event.target.text === 'Telugu Movies 2018') {
            Axios.get('http://localhost:9000/telugu/2018/')
                .then(response => {
                    console.log(response.data)
                    this.setState({movies: response.data})
                })
        }

        //Telugu
        if(event.target.text === 'Telugu Movies 2017') {
            console.log('2017 clicked....')
            Axios.get('http://localhost:9000/telugu/2017/')
                .then(response => {
                    console.log(response.data)
                    this.setState({movies: response.data})
                })
        }
        
    }

    render() {

        var searchedMovies = ''

        if(this.state.movies !== undefined ) {
            searchedMovies = this.state.movies.map((element)=> {
                // if(element.large_cover_image === undefined) {element.large_cover_image = element.image; console.log(element.torrents);}
                this.state.loader = true                                //IMPROV: <---- Not a good practice
                this.state.onPlex = element.onPlex                     //IMPROV: <---- Not a good practice
                return(<Card key={Math.random()} rating={element.rating} onPlex={this.state.onPlex} genre={element.genres} torrent={element.torrents} language={element.language} synopsis={element.synopsis} title={element.title} image={element.large_cover_image} heading={element.title} year={element.year}/>)
            })
            if (searchedMovies === '') this.state.loader = false
        }

        return(
        <div>
            <div>
            { this.didLoad(this.state.loader) }
                <nav style={{'paddingBottom': 0, 'marginBottom': 0, 'borderBottom': 0, 'paddingTop': 0, 'marginTop': 0, 'borderTop': 0}} className="navbar-fixed">
                    <div class="nav-wrapper teal lighten-2 navbar-fixed" style={{'paddingBottom': 0, 'marginBottom': 0, 'borderBottom': 0, 'paddingTop': 0, 'marginTop': 0, 'borderTop': 0}}>
                        <div class=" row hide-on-down left valign-wrapper" style={{'width': 200, 'paddingTop': 6, 'paddingBottom': 0, 'marginBottom': 0,  'borderBottom': 0}}>
                            <div class="col s12 " style={{'paddingTop': 0, 'marginTop': 0, 'borderTop': 0}} >
                                <form onSubmit={this.onSubmit} >
                                    <div class="row" id="topbarsearch" style={{'paddingBottom': 0, 'marginBottom': 0, 'borderBottom': 0, 'paddingTop': 0, 'marginTop': 0, 'borderTop': 0}}>
                                        <div class="col s6 s12 red-text">
                                            <div className="input-field inline">
                                                <input type="text" placeholder="Search English Movies..." onKeyDown={this.onKeyDown}
                                                id="" class=" white-text italic left inline" style={{'fontStyle': 'oblique', 
                                                'fontWeight': 'normal', 'width': 200, 'float': 'right'}} onChange={this.onChange} />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>     
                        </div> 
                        <a href="#" data-target="mobile-demo" class="sidenav-trigger right"><i class="material-icons">menu</i></a>
                        <ul class="right hide-on-med-and-down" style={{'paddingBottom': 0, 'marginBottom': 0, 'borderBottom': 0}}>
                            <li><a href="" style={{'paddingRight': 20}}>Home</a></li>
                            <li><a href="badges.html" style={{'paddingRight': 20}}>English</a></li>
                            <li><a href="collapsible.html" style={{'paddingRight': 20}}>Telugu</a></li>
                            <li><a href="mobile.html" style={{'paddingRight': 25}}>Hindi</a></li>
                        </ul>
                        
                    </div>
                   
                </nav> 
                
                <ul class="sidenav" id="mobile-demo">
                    <li><a href="">Home</a></li>
                    <ul class="collapsible">
                        <li className="active">
                        <div class="collapsible-header"><i class="material-icons">local_movies</i>English</div>
                        <div class="collapsible-body sidenav-close">
                            <ul>
                                <li><a href="#" onClick={this.onClick}>Popular Downloads</a></li>
                                <li><a href="#" onClick={this.onClick}>Action</a></li>
                                <li><a href="#" onClick={this.onClick}>Adventure</a></li>
                                <li><a href="#" onClick={this.onClick}>Comedy</a></li>
                                <li><a href="#" onClick={this.onClick}>Family</a></li>
                                <li><a href="#" onClick={this.onClick}>Fantasy</a></li>
                                <li><a href="#" onClick={this.onClick}>Horror</a></li>
                                <li><a href="#" onClick={this.onClick}>Sci-Fi</a></li>
                                <li><a href="#" onClick={this.onClick}>Thriller</a></li>
                            </ul>
                        </div>
                        </li>
                        <li>
                        <div class="collapsible-header"><i class="material-icons">movie_filter</i>Telugu<span class="new badge"></span></div>
                        <div class="collapsible-body sidenav-close">
                            <ul>
                                <li><a href="#" onClick={this.onClick}><span class="new badge"></span>Featurd Telugu</a></li>
                                <li><a href="#" onClick={this.onClick}><span class="new badge"></span>Telugu Movies 2019</a></li>
                                <li><a><span class="badge">Pending</span>Telugu Movies 2018</a></li>
                                <li><a><span class="badge">Pending</span>Telugu Movies 2017</a></li>
                            </ul>
                        </div>
                        </li>
                        <li>
                        <div class="collapsible-header"><i class="material-icons">movie</i>Hindi<span class="badge">Pending</span></div>
                        <div class="collapsible-body sidenav-close">
                            <ul>
                                <li><a><span class="badge">Pending</span>Featurd Hindi</a></li>
                                <li><a><span class="badge">Pending</span>Hindi Movies 2019</a></li>
                                <li><a><span class="badge">Pending</span>Hindi Movies 2018</a></li>
                                <li><a><span class="badge">Pending</span>Hindi Movies 2017</a></li>
                            </ul>
                        </div>
                        </li>
                    </ul>
                </ul>
            </div>
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

