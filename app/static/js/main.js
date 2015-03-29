buildHeaderBackground($(window).height(), 100, 5);
resizeDiv($('#scrolling-background'), 500);
resizeDiv($('.transparent-overlay'), 500);
resizeDiv($('.header-container'), 500);

(function(){
    var app = angular.module('movieInfo', []);

    var movie = {};

    app.controller('MovieController', function(){
        this.info = movie;
    });

    app.controller('SearchController', ['$http', function($http){
        this.movie = {};

        this.searchMovie = function() {
            // Search for a movie based on the title and release year
            var title = this.movie.title;
            var year = this.movie.year || "";

            // Clear everything first
            clearResults();
            startLoadingSpinner();

            // Fetch from our own database first if the movie exists
            $http.get('/api/get_movie?movie_title=' + title + '&movie_year=' + year
            ).success(function(movie) {
                // Display result
                if (movie.length === 0) {
                    // The movie doesn't exist in the database, so we fetch from OMDb
                    searchMovieFromOMDb(title, year, $http);
                } else {
                    // Otherwise fetch it from our own database
                    handleDatabaseResponse(movie);
                }
            }).error(function() {
                alertModal('Too much traffic', '<p>It looks like too many people are trying to search for movies! Try again at a later time.</p>');
            });
        };
    }]);
})();


// $(document).ready(function() {
//     $('#search-btn').on('click', function(event) {
//         event.preventDefault();

//         $('#no-results').hide();
//         $('#movie-results').animate({opacity: 0});

//         var title = $('#movie-title').val();
//         var year = $('#movie-year').val();

//         // Popovers to display validation errors
//         $('#movie-title').popover({'trigger':'manual'});
//         $('#movie-year').popover({'trigger':'manual'});
//         $('#movie-title').on('focus', function() {
//             $(this).popover('destroy');
//         });
//         $('#movie-year').on('focus', function() {
//             $(this).popover('destroy');
//         });
//         if (!validateInput(title, 'is_not_empty')) {
//             $('#movie-title').popover('show');
//             return;
//         }
//         if (!validateInput(+year, 'is_valid_year')) {
//             $('#movie-year').popover('show');
//             return;
//         }

//         searchMovie(title, year);
//     });
// });

function buildHeaderBackground(containerHeight, rowHeight, minRows) {
    // Creates the wall of movie-posters in the background that is animated via CSS.
    var container = $('#scrolling-background');

    var rowsNeeded = Math.ceil(containerHeight / rowHeight);

    // Minimum 5 rows
    rowsNeeded = rowsNeeded < 5 ? 5 : rowsNeeded;

    for (var i = 0; i < rowsNeeded; i++) {
        direction = i % 2 === 0 ? 'left' : 'right';
        container.append('<div class="background-'+(i%10)+' scroll-'+direction+' background-poster"></div>');   
    }
}

function resizeDiv(div, minHeight) {
    // Resizes a div to match the window height
    if ($(window).height() > minHeight) {
        div.css('height', $(window).height());
    }
}

function validateInput(input, condition) {
    // Ensures the movie title is not blank and the year entered is reasonable
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

function loadMovie(imdb_id) {
    // Search for a movie based on the imdb_id
    if (!imdb_id || imdb_id.length === 0) {
        return;
    }

    // Clear everything first
    clearResults();

    // Fetch from our own database first if the movie exists
    $.ajax({
        url: '/api/get_movie_by_id',
        type: 'GET',
        data: {
            imdb_id: imdb_id
        }
    }).done(function(movie) {
        // Display result
        if (movie.length === 0) {
            // The movie doesn't exist in the database, so we fetch from OMDb
            loadMovieFromOMDb(imdb_id);
        } else {
            // Otherwise fetch it from our own database
            movie = JSON.parse(movie);
            handleDatabaseResponse(movie);
        }
    }).fail(function() {
        alertModal('Too much traffic', '<p>It looks like too many people are trying to search for movies! Try again at a later time.</p>');
    });    

}


function handleDatabaseResponse(response) {
    // Handle the data passed back from our database
    stopLoadingSpinner();
    showMovieInfo(response);
}

function loadMovieFromOMDb(imdb_id) {
    // Fetches movie information by imdb_id from OMDb (http://www.omdbapi.com/)
    $.ajax({
        url: 'http://www.omdbapi.com/?i=' + imdb_id,
        type: 'GET',
    }).done(function(response) {
        response = JSON.parse(response);
        handleOMDbResponse(response);
    })
    .fail(function() {
        alertModal('OMDb is down', '<p>It looks like the OMDb server where we fetch our data is down. If you try again later the server may be back online.</p>');
    });
    
}

function searchMovieFromOMDb(title, year, $http) {
    // Fetches movie information by title and year from OMDb (http://www.omdbapi.com/)
    $http.get('http://www.omdbapi.com/?t=' + title + '&y=' + year + '&plot=full&r=json'
    ).success(function(response) {
        handleOMDbResponse(response);
    }).error(function() {
        alertModal('OMDb is down', '<p>It looks like the OMDb server where we fetch our data is down. If you try again later the server may be back online.</p>');
    });
}

function handleOMDbResponse(response) {
    // Handles the response from OMDb, displaying error messages if necessary.
    var movie = response;

    stopLoadingSpinner();

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
        // This AJAX request uses the separate API to retrieve movie posters.
        // Used to get around the 403 error when code is in production.
        // TODO: OMDb hasn't emailed me my API key yet, I have to set this up when they reply to me.
        // TODO: Fetch the API key using Python from the backend, and store the API key in an environment variable.
        // $.ajax({
        //     url: 'http://img.omdbapi.com/?i=' + movie.imdbID + '&apikey=',
        //     type: 'GET'
        // }).done(function(poster) {
        //     showMoviePoster(poster, movie.Title);
        // });

        // Show the movie information
        showMovieInfo(movie);
        // Cache the result in our database so that we don't have to call the OMDb API again.
        cacheMovie(movie);
    }
}

function cacheMovie(movie) {
    // Cache the movie in our database
    movie = JSON.stringify(movie);
    $.ajax({
        url: '/api/cache_movie',
        type: 'POST',
        data: {movie_data: movie}
    });
}

function startLoadingSpinner() {
    // Start the loading spinner
    $('.loading-spinner').addClass('loading-enabled');
    $('#search-btn').addClass('loading-disabled');
}

function stopLoadingSpinner() {
    // Stop the loading spinner
    $('.loading-spinner').removeClass('loading-enabled');
    $('#search-btn').removeClass('loading-disabled');
}

function showMovieInfo(movie) {
    // Populates the movie data into the DOM elements on the page
    var result = $('#movie-info');

    window.history.pushState(null, null, '/movie/' + movie.imdbID);

    // Comment out this line when using the separate OMDb API to retrieve movie posters.
    showMoviePoster(movie.Poster, movie.Title);

    if (movie.Title !== 'N/A')      result.children('.title')   .html(movie.Title);
    if (movie.imdbRating !== 'N/A') result.children('.stars')   .html(convertStars(movie.imdbRating));
    if (movie.Rated !== 'N/A' && movie.Rated !== 'Not Rated') { result.children('.rated').html("Rated " + movie.Rated);} else {result.children('.rated').html("Unrated");}
    if (movie.Year !== 'N/A')       result.children('.year')    .html("Released " + movie.Year);
    if (movie.Genre !== 'N/A')      result.children('.genre')   .html(movie.Genre);
    if (movie.Plot !== 'N/A')       result.children('.plot')    .html(movie.Plot);
    if (movie.Runtime !== 'N/A')    result.children('.runtime') .html("Runtime " + movie.Runtime);
    if (movie.Actors !== 'N/A')     result.children('.actors')  .html('<span class="movie-label">'+pluralize("Actor",movie.Actors)+': </span><p>'+movie.Actors+'</p>');
    if (movie.Director !== 'N/A')   result.children('.director').html('<span class="movie-label">'+pluralize("Director",movie.Director)+': </span><p>'+movie.Director+'</p>');
    if (movie.Writer !== 'N/A')     result.children('.writer')  .html('<span class="movie-label">'+pluralize("Writer",movie.Writer)+': </span><p>'+movie.Writer+'</p>');
    if (movie.Awards !== 'N/A')     result.children('.awards')  .html('<span class="movie-label">Awards: </span><p>'+movie.Awards+'</p>');

    // Generate links for social media buttons
    var statusMesssage;
    if (movie.Title !== 'N/A') {
        statusMesssage = encodeURIComponent('Check out the movie '+ movie.Title + ': ');
    } else {
        statusMesssage = '';
    }
    $('.ssk-facebook').attr('href','https://www.facebook.com/sharer/sharer.php?u=' + window.location.href);
    $('.ssk-twitter').attr('href','https://twitter.com/home?status=' + statusMesssage + window.location.href);
    $('.ssk-google-plus').attr('href','https://plus.google.com/share?url=' + window.location.href);

    $('#movie-results').animate({opacity: 1}, 200, 'linear', function() {
        $('html,body').animate({
            scrollTop: $('#results-page').offset().top
        },500);
    });
}

function showMoviePoster(poster, title) {
    // Displays the movie poster in the results
    if (poster !== 'N/A') {
        $('#movie-poster').children('img').attr('src',poster).attr('alt',title);
    }
}

function clearResults() {
    // Clears movie data from the DOM elements in the page
    $('#movie-poster').children('img').attr('src','/static/img/no_poster.png').attr('alt','No movie poster available');
    $('#movie-info').children().html('');
    $('.ssk-facebook').attr('href','');
    $('.ssk-twitter').attr('href','');
    $('.ssk-google-plus').attr('href','');

}

function convertStars(score, maxStars, numStars) {
    // Conerts an n-star system into a 5-star system.
    score = parseFloat(score);
    maxStars = maxStars || 10;
    numStars = numStars || 5;

    var stars = score / maxStars;

    var filledStars = Math.floor(stars * numStars);
    var halfStars = (stars * numStars - filledStars) > 0.4; // Only make a half star if the LSV is > 0.4
    var emptyStars = numStars - filledStars - halfStars;

    var result = '';
    for (var i = 0; i < filledStars; i++) {
        result += '<i class="fa fa-star"></i>';
    }
    if (halfStars) {
        result += '<i class="fa fa-star-half-o"></i>';
    }
    for (var j = 0; j < emptyStars; j++) {
        result += '<i class="fa fa-star-o"></i>';
    }
    return result;
}

function pluralize(role, people) {
    // Pluralize the noun if there is more than one person
    // E.g. "Director" -> "Directors"
    if (people.indexOf(',') > -1) {
        return role + "s";
    } else {
        return role;
    }
}

function alertModal(title, body) {
    // Display error message to the user in a modal
    $('#alert-modal-title').html(title);
    $('#alert-modal-body').html(body);
    $('#alert-modal').modal('show');
}

