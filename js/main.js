var success_response = {
    "Title": "The Matrix",
    "Year": "1999",
    "Rated": "R",
    "Released": "31 Mar 1999",
    "Runtime": "136 min",
    "Genre": "Action, Sci-Fi",
    "Director": "Andy Wachowski, Lana Wachowski",
    "Writer": "Andy Wachowski, Lana Wachowski",
    "Actors": "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss, Hugo Weaving",
    "Plot": "Thomas A. Anderson is a man living two lives. By day he is an average computer programmer and by night a hacker known as Neo. Neo has always questioned his reality, but the truth is far beyond his imagination. Neo finds himself targeted by the police when he is contacted by Morpheus, a legendary computer hacker branded a terrorist by the government. Morpheus awakens Neo to the real world, a ravaged wasteland where most of humanity have been captured by a race of machines that live off of the humans' body heat and electrochemical energy and who imprison their minds within an artificial reality known as the Matrix. As a rebel against the machines, Neo must return to the Matrix and confront the agents: super-powerful computer programs devoted to snuffing out Neo and the entire human rebellion.",
    "Language": "English",
    "Country": "USA, Australia",
    "Awards": "Won 4 Oscars. Another 34 wins & 39 nominations.",
    "Poster": "http://ia.media-imdb.com/images/M/MV5BMTkxNDYxOTA4M15BMl5BanBnXkFtZTgwNTk0NzQxMTE@._V1_SX300.jpg",
    "Metascore": "73",
    "imdbRating": "8.7",
    "imdbVotes": "992,323",
    "imdbID": "tt0133093",
    "Type": "movie",
    "Response": "True"
};

var fail_response = {
    "Response": "False",
    "Error": "Movie not found!"
};
var CONST = {};
CONST.OMDB_BASE_URL = 'http://www.omdbapi.com/';

$(document).ready(function() {
    $('#search-btn').on('click', function(event) {
        event.preventDefault();

        var title = encodeURIComponent($('#movie-title').val());
        var year = encodeURIComponent($('#movie-year').val());

        if (!validate(title, 'is_not_empty') || !validate(parseInt(year), 'is_valid_year')) {
            // TODO: Display a validation error to the user
            return;
        }
        console.log(title);
        console.log(year);
        // result = getMovieFromOMDb(title, year);
        
    });
});

function validate(input, condition) {
    switch (condition) {
        case undefined:
            return false;
        case 'is_not_empty':
            return !!input;
        case 'is_valid_year':
            return !isNaN(input) && input > 1000 && input < 9999;
        default:
            return false;
    }
}

function getMovieFromOMDb(title, year) {
    $.ajax({
        url: CONST.OMDB_BASE_URL + '?title=' + title + '&year=' + year,
        type: 'default GET (Other values: POST)',
        dataType: 'default: Intelligent Guess (Other values: xml, json, script, or html)',
        data: {param1: 'value1'},
    })
    .done(function() {
        console.log("success");
    })
    .fail(function() {
        console.log("error");
    });
}