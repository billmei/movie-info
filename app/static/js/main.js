(function(){
    buildHeaderBackground($(window).height(), 100, 5);
    resizeDiv($('#scrolling-background'), 500);
    resizeDiv($('.transparent-overlay'), 500);
    resizeDiv($('.header-container'), 500);

    var app = angular.module('movieInfo', ['ngSanitize']);

    // Resolve conflict between Jinja2 tags and Angular tags
    // Jinja2 uses {{}} so make Angular use {[]}
    app.config(['$interpolateProvider', function($interpolateProvider) {
        $interpolateProvider.startSymbol('{[');
        $interpolateProvider.endSymbol(']}');
    }]);

    app.factory('MovieService', function() {
        return {
            'movie' : {}
        };
    });

    app.controller('SearchController', ['$rootScope', '$http', 'MovieService',
        function($rootScope, $http, MovieService) {
        $rootScope.movie = MovieService.movie;
        var self = this;

        this.searchMovie = function(imdb_id) {
            $('#no-results').hide();
            $('#movie-results').animate({opacity: 0}, 200, 'linear', function() {
                var serverURL;

                if (imdb_id) {
                    serverURL = '/api/get_movie?imdb_id=' + imdb_id;
                } else {
                    var title = $rootScope.movie.input_title;
                    var year = $rootScope.movie.input_year || '';

                    // Validate results
                    if (!self.isValidInput(title, 'is_not_empty')) {
                        $('#movie-title').popover('show');
                        return;
                    }
                    if (!self.isValidInput(+year, 'is_valid_year')) {
                        $('#movie-year').popover('show');
                        return;
                    }

                    $('#movie-title').popover('destroy');
                    $('#movie-year').popover('destroy');
                    serverURL = '/api/get_movie?movie_title=' + title + '&movie_year=' + year;

                    // Results are valid, go ahead and search
                    startLoadingSpinner();
                }

                // Search for the movie
                $http.get(serverURL, {timeout: 5000}
                ).success(function(response) {
                    
                    $rootScope.movie = response;

                }).error(function(data, status, headers, config) {
                    if (status === 404) {
                        alertModal('Movie Not Found', '<p>Sorry! We could not find a movie with that title.</p>');
                    } else {
                        alertModal('OMDb is down', '<p>It looks like the OMDb server where we fetch our data is down. If you try again later the server may be back online.</p>');
                    }

                    $rootScope.movie = MovieService.movie;

                    stopLoadingSpinner();
                    $('#no-results').slideDown(500);
                });
            });
        };

        this.isValidInput = function(input, condition) {
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
        };
    }]);

    app.controller('MovieController', ['$scope', '$rootScope', 'MovieService',
        function($scope, $rootScope, MovieService){
        $rootScope.movie = MovieService.movie;
        var self = this;
        self.movie = {};

        $rootScope.$watch(function() {
            return $rootScope.movie.title;
        }, function() {
            self.movie = $rootScope.movie;
            self.movie.parsedRated = self.getRating();
            self.movie.parsedStars = self.getStars(self.movie.imdb_rating);
            self.movie.parsedDirectors = self.getRole("Director", self.movie.director);
            self.movie.parsedActors = self.getRole("Actor", self.movie.actors);
            self.movie.parsedWriters = self.getRole("Writer", self.movie.writer);
            self.movie.parsedAwards = self.getRole("Award", self.movie.awards);
            self.movie.facebookURL = self.getShareUrl("facebook", self.movie.title);
            self.movie.twitterURL = self.getShareUrl("twitter", self.movie.title);
            self.movie.gplusURL = self.getShareUrl("gplus", self.movie.title);

            if (self.movie.imdb_id) {
                window.history.pushState(null, null, '/movie/' + self.movie.imdb_id);
                scrollToResults();
            }
        });

        this.getRating = function() {
            if (this.movie.rated && this.movie.rated !== 'Not Rated' && this.movie.rated !== 'N/A') {
                return 'Rated ' + this.movie.rated;
            } else {
                return 'Unrated';
            }
        };

        this.getStars = function(score, maxStars, numStars) {
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
        };

        this.getRole = function(role, people) {
            if (!people || people === 'N/A') { return; }
            return '<span class="movie-label">' + this.pluralize(role, people) +': </span>' +
                   '<p>' + people + '</p>';
        };

        this.pluralize = function(role, people) {
            // Pluralize the noun if there is more than one person
            // E.g. "Director" -> "Directors"
            if (people.indexOf(',') > -1 || role === 'Award') {
                return role + 's';
            } else {
                return role;
            }
        };

        this.getShareUrl = function(channel, movieTitle) {
            // Generate links for social media buttons
            switch (channel) {
                case 'facebook':
                    return 'https://www.facebook.com/sharer/sharer.php?u=' + window.location.href;
                case 'twitter':
                    var statusMesssage;
                    if (movieTitle !== 'N/A') {
                        statusMesssage = encodeURIComponent('Check out the movie '+ movieTitle + ': ');
                    } else {
                        statusMesssage = '';
                    }
                    return 'https://twitter.com/home?status=' + statusMesssage + window.location.href;
                case 'gplus':
                    return 'https://plus.google.com/share?url=' + window.location.href;
            }
        };
    }]);
    
    // Popovers to display validation errors
    $('#movie-title').popover({'trigger':'manual'});
    $('#movie-year').popover({'trigger':'manual'});
    $('#movie-title').on('focus', function() {
        $(this).popover('destroy');
    });
    $('#movie-year').on('focus', function() {
        $(this).popover('destroy');
    });


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

    function scrollToResults() {
        $('#movie-results').animate({opacity: 1}, 200, 'linear', function() {
            $('html,body').animate({
                scrollTop: $('#results-page').offset().top
            }, 500);
        });
        stopLoadingSpinner();
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

    function alertModal(title, body) {
        // Display error message to the user in a modal
        $('#alert-modal-title').html(title);
        $('#alert-modal-body').html(body);
        $('#alert-modal').modal('show');
    }
})();
