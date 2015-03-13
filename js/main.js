scrollingBackground();

/*
TODO:
    - Setup Flask
    Create a test suite and assert all params >>> Comment: Not deleted for assessment.
*/

$(document).ready(function() {
    $('#search-btn').on('click', function(event) {
        event.preventDefault();
        $('#no-results').hide();
        $('#movie-results').animate({opacity: 0});

        var title = $('#movie-title').val();
        var year = $('#movie-year').val();

        // Popovers to display validation errors
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

        // Start the loading spinner
        $('.loading-spinner').addClass('loading-enabled');
        $('#search-btn').addClass('loading-disabled');
        loadMovieFromOMDb(title, year);

    });
});

function scrollingBackground() {
    // Animates the wall of movie-posters in the background
    var container = $('#scrolling-background');
    for (var i = 0; i < 5; i++) {
        direction = i % 2 === 0 ? 'left' : 'right';
        container.append('<div class="background-'+i+' scroll-'+direction+' background-poster"></div>');   
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

function loadMovieFromOMDb(title, year) {
    // Fetches movie information from OMDb
    // http://www.omdbapi.com/

    // Clear everything first
    clearResults();

    $.ajax({
        url: 'http://www.omdbapi.com/?t=' + title + '&y=' + year + '&plot=full&r=json',
        type: 'GET'
    }).done(function(movie) {
        movie = JSON.parse(movie);

        // Stop the loading spinner
        $('.loading-spinner').removeClass('loading-enabled');
        $('#search-btn').removeClass('loading-disabled');

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
    }).fail(function(movie) {
        alertModal('OMDb is down', '<p>It looks like the OMDb server where we fetch our data is down. If you try again later the server may be back online.</p>');
    });
}

function displayResults(movie) {
    // Populates the movie data into the DOM elements on the page
    var result = $('#movie-info');

    if (movie.Poster !== 'N/A') {
        $('#movie-poster').children().attr('src',movie.Poster).attr('alt',movie.Title);
    }

    if (movie.Title !== 'N/A')      result.children('.title')   .html(movie.Title);
    if (movie.imdbRating !== 'N/A') result.children('.stars')   .html(convertStars(movie.imdbRating));
    if (movie.Rated !== 'N/A') {    result.children('.rated')   .html("Rated " + movie.Rated);} else {result.children('.rated').html("Unrated");}
    if (movie.Year !== 'N/A')       result.children('.year')    .html("Released " + movie.Year);
    if (movie.Genre !== 'N/A')      result.children('.genre')   .html(movie.Genre);
    if (movie.Plot !== 'N/A')       result.children('.plot')    .html(movie.Plot);
    if (movie.Runtime !== 'N/A')    result.children('.runtime') .html("Runtime " + movie.Runtime);
    if (movie.Actors !== 'N/A')     result.children('.actors')  .html('<span class="movie-label">'+pluralize("Actor",movie.Actors)+': </span><p>'+movie.Actors+'</p>');
    if (movie.Director !== 'N/A')   result.children('.director').html('<span class="movie-label">'+pluralize("Director",movie.Director)+': </span><p>'+movie.Director+'</p>');
    if (movie.Writer !== 'N/A')     result.children('.writer')  .html('<span class="movie-label">'+pluralize("Writer",movie.Writer)+': </span><p>'+movie.Writer+'</p>');
    if (movie.Awards !== 'N/A')     result.children('.awards')  .html('<span class="movie-label">Awards: </span><p>'+movie.Awards+'</p>');

    $('#movie-results').animate({opacity: 1}, 200, 'linear', function() {
        $('html,body').animate({
            scrollTop: $('#results-page').offset().top
        },500);
    });
}

function clearResults() {
    // Clears movie data from the DOM elements in the page
    $('#movie-poster').children().attr('src','img/no_poster.png').attr('alt','No movie poster available');
    $('#movie-info').children().html('');
}

function convertStars(score, maxStars, numStars) {
    // Conerts an n-star system to a 5-star system.
    score = parseFloat(score);
    maxStars = maxStars || 10;
    numStars = numStars || 5;

    var stars = score / maxStars;

    var filledStars = Math.floor(stars * numStars);
    var halfStars = (stars * numStars - filledStars) > 0.4; // Only make a half star if the LSV is > 0.4
    var emptyStars = numStars - filledStars - halfStars;

    result = '';
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

