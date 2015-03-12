var success_response = {"Title":"Pulp Fiction","Year":"1994","Rated":"R","Released":"14 Oct 1994","Runtime":"154 min","Genre":"Crime, Drama, Thriller","Director":"Quentin Tarantino","Writer":"Quentin Tarantino (story), Roger Avary (story), Quentin Tarantino","Actors":"Tim Roth, Amanda Plummer, Laura Lovelace, John Travolta","Plot":"Jules Winnfield and Vincent Vega are two hitmen who are out to retrieve a suitcase stolen from their employer, mob boss Marsellus Wallace. Wallace has also asked Vincent to take his wife Mia out a few days later when Wallace himself will be out of town. Butch Coolidge is an aging boxer who is paid by Wallace to lose his next fight. The lives of these seemingly unrelated people are woven together comprising of a series of funny, bizarre and uncalled-for incidents.","Language":"English, Spanish, French","Country":"USA","Awards":"Won 1 Oscar. Another 63 wins & 47 nominations.","Poster":"http://ia.media-imdb.com/images/M/MV5BMjE0ODk2NjczOV5BMl5BanBnXkFtZTYwNDQ0NDg4._V1_SX300.jpg","Metascore":"94","imdbRating":"8.9","imdbVotes":"1,086,222","imdbID":"tt0110912","Type":"movie","Response":"True"};
var fail_response = {
    "Response": "False",
    "Error": "Movie not found!"
};

scrollingBackground();

$(document).ready(function() {
    $('#search-btn').on('click', function(event) {
        event.preventDefault();
        $('#no-results').hide();
        $('#movie-results').animate({opacity: 0});

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

        $('.loading-spinner').addClass('loading-enabled');
        $('#search-btn').addClass('loading-disabled');
        loadMovieFromOMDb(title, year);

    });
});

function scrollingBackground() {
    var container = $('#scrolling-background');
    for (var i = 0; i < 10; i++) {
        direction = i % 2 === 0 ? 'left' : 'right';
        container.append('<div class="background-'+i+' scroll-'+direction+'"></div>');   
    }
    // Make the div 2x the size of the image, and then make it 
}

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

function loadMovieFromOMDb(title, year) {
    // TODO: Make sure this works
    // $.ajax({
        // url: 'http://www.omdbapi.com/?t=' + title + '&y=' + year + '&plot=full&r=json',
        // type: 'GET'
    // }).done(function(movie) {
        var movie = success_response;
        // var movie = fail_response;

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
    // }).fail(function(movie) {
    //     alertModal('OMDb is down', '<p>It looks like the OMDb server where we fetch our data is down. If you try again later the server may be back online.</p>');
    // });
}

function displayResults(movie) {
    var result = $('#movie-info');
    // TODO: Handle cases when no data is returned, e.g. Movie does not have a poster.
    $('#movie-poster').children().attr('src',movie.Poster).attr('alt',movie.Title);

    result.children('.title')   .html(movie.Title);
    result.children('.stars')   .html(convertStars(movie.imdbRating));
    result.children('.rated')   .html("Rated " + movie.Rated);
    result.children('.year')    .html("Released " + movie.Year);
    result.children('.genre')   .html(movie.Genre);
    result.children('.plot')    .html(movie.Plot);
    result.children('.runtime') .html("Runtime " + movie.Runtime);
    result.children('.actors')  .html('<span class="movie-label">'+pluralize("Actor",movie.Actors)+': </span><p>'+movie.Actors+'</p>');
    result.children('.director').html('<span class="movie-label">'+pluralize("Director",movie.Director)+': </span><p>'+movie.Director+'</p>');
    result.children('.writer')  .html('<span class="movie-label">'+pluralize("Writer",movie.Writer)+': </span><p>'+movie.Writer+'</p>');

    $('#movie-results').animate({opacity: 1}, 200, 'linear', function() {
        $('html,body').animate({
            scrollTop: $('#results-page').offset().top
        },500);
    });
}

function convertStars(score, maxStars, numStars) {
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
    if (people.indexOf(',') > -1) {
        return role + "s";
    } else {
        return role;
    }
}


function alertModal(title, body) {
    $('#alert-modal-title').html(title);
    $('#alert-modal-body').html(body);
    $('#alert-modal').modal('show');
}

