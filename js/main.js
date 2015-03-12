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

$(document).ready(function() {
    $('#search-btn').on('click', function(event) {
        event.preventDefault();
        $('#no-results').hide();
        $('#movie-info').animate({opacity: 0});

        var title = $('#movie-title').val();
        var year = $('#movie-year').val();

        $('#movie-title').popover({'trigger':'manual'});
        $('#movie-year').popover({'trigger':'manual'});
        $('#movie-title').on('focus', function() {
            $(this).popover('destroy');
        });
        $('#movie-year').on('focus', function() {
            $(this).popover('destroy');
        });

        if (!validateInput(title, 'is_not_empty')) {
            $('#movie-title').popover('show');
            return;
        }
        if (!validateInput(+year, 'is_valid_year')) {
            $('#movie-year').popover('show');
            return;
        }

        // TODO: Start loading spinner

        // movie = getMovieFromOMDb(title, year);
        var movie = success_response;
        // var movie = fail_response;

        if (movie.Response === 'False') {
            if (movie.Error === 'Movie not found!') {
                $('#no-results').slideDown(500);
                alertModal('Movie Not Found', '<p>Sorry! We could not find a movie with that title.</p>');
            } else {
                alertModal('OMDb is down', '<p>It looks like the OMDb server where we fetch our data is down. If you try again later the server may be back online.</p>');
            }
        } else if (!movie) {
            $('#no-results').slideDown(500);
        } else {
            displayResults(movie);
        }
    });
});

function validateInput(input, condition) {
    // TODO: Delete this when you're finished testing
    return true;

    switch (condition) {
        case undefined:
            return false;
        case 'is_not_empty':
            return !!input;
        case 'is_valid_year':
            return input === 0 || !isNaN(input) && input > 1000 && input <= new Date().getFullYear();
        default:
            return false;
    }
}

function getMovieFromOMDb(title, year) {
    // TODO: Make sure this works
    $.ajax({
        url: 'http://www.omdbapi.com/?t=' + title + '&y=' + year + '&plot=full&r=json',
        type: 'GET'
    })
    .done(function(response) {
        // TODO: Remove loading spinner
        return response;
    })
    .fail(function(response) {
        alertModal('OMDb is down', '<p>It looks like the OMDb server where we fetch our data is down. If you try again later the server may be back online.</p>');
        return response;
    });
}

function displayResults(movie) {
    var result = $('#movie-info');
    // TODO: Handle cases when no data is returned, e.g. Movie does not have a poster.
    result.children('.poster').children().attr('src',movie.Poster).attr('alt',movie.Title);

    result.children('.title')   .html(movie.Title);
    result.children('.stars')   .html(convertStars(movie.imdbRating));
    result.children('.rated')   .html("Rated " + movie.Rated);
    result.children('.year')    .html("Released " + movie.Year);
    result.children('.genre')   .html(movie.Genre);
    result.children('.plot')    .html(movie.Plot);
    result.children('.runtime') .html("Runtime " + movie.Runtime);
    // TODO: Turn this into a ul with a bullet point lists
    //       the class name is .list
    result.children('.actors')  .html(pluralize("Actor",movie.Actors));
    result.children('.director').html(pluralize("Director",movie.Director));
    result.children('.writer')  .html(pluralize("Writer",movie.Writer));

    result.animate({opacity: 1}, 200, 'linear', function() {
        $('html,body').animate({
            scrollTop: $('#results-page').offset().top
        },500);
    });
}

function convertStars(score, maxStars, numStars) {
    score = parseInt(score);
    maxStars = maxStars || 10;
    numStars = numStars || 5;

    var stars = score / maxStars;

    var filledStars = Math.floor(stars * numStars);
    var emptyStars = numStars - filledStars;

    result = '';
    for (var i = 0; i < filledStars; i++) {
        result += '<i class="glyphicon glyphicon-star"></i>';
    }
    for (var j = 0; j < emptyStars; j++) {
        result += '<i class="glyphicon glyphicon-star-empty"></i>';
    }
    return result;
}

function pluralize(role, people) {
    if (people.indexOf(',') > -1) {
        return role + "s: " + people;
    } else {
        return role + ": " + people;
    }
}


function alertModal(title, body) {
    $('#alert-modal-title').html(title);
    $('#alert-modal-body').html(body);
    $('#alert-modal').modal('show');
}

function assert(condition, message) {
    if (!condition) {
        throw Error('Assert failed' + (typeof message !== 'undefined' ? ': ' + message : ''));
    }
}

// indexOf Polyfill from MDN
// Production steps of ECMA-262, Edition 5, 15.4.4.14
// Reference: http://es5.github.io/#x15.4.4.14
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(searchElement, fromIndex) {
    var k;
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }
    var O = Object(this);
    var len = O.length >>> 0;
    if (len === 0) {
      return -1;
    }
    var n = +fromIndex || 0;
    if (Math.abs(n) === Infinity) {
      n = 0;
    }
    if (n >= len) {
      return -1;
    }
    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
    while (k < len) {
      if (k in O && O[k] === searchElement) {
        return k;
      }
      k++;
    }
    return -1;
  };
}
