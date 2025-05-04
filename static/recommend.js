$(function () {
    // Button will be disabled until we type anything inside the input field
    const source = document.getElementById('autoComplete');
    const inputHandler = function (e) {
      $('.movie-button').attr('disabled', e.target.value === "");
    };
    source.addEventListener('input', inputHandler);
  
    $('.movie-button').on('click', function () {
      const my_api_key = '7fee067b60fd14ed0bd0013b0863045f';
      const title = $('.movie').val();
      if (title === "") {
        $('.results').hide();
        $('.fail').show();
      } else {
        load_details(my_api_key, title);
      }
    });
  });
  
  function recommendcard(e) {
    const my_api_key = '7fee067b60fd14ed0bd0013b0863045f';
    const title = e.getAttribute('title');
    load_details(my_api_key, title);
  }
  
  function load_details(my_api_key, title) {
    $.ajax({
      type: 'GET',
      url: 'https://api.themoviedb.org/3/search/movie?api_key=' + my_api_key + '&query=' + title,
      success: function (movie) {
        if (movie.results.length < 1) {
          $('.fail').show();
          $('.results').hide();
          $("#loader").delay(500).fadeOut();
        } else {
          $("#loader").fadeIn();
          $('.fail').hide();
          $('.results').delay(1000).show();
          const movie_id = movie.results[0].id;
          const movie_title = movie.results[0].original_title;
          movie_recs(movie_title, movie_id, my_api_key);
        }
      },
      error: function () {
        alert('Invalid Request');
        $("#loader").delay(500).fadeOut();
      },
    });
  }
  
  function movie_recs(movie_title, movie_id, my_api_key) {
    $.ajax({
      type: 'POST',
      url: "/similarity",
      data: { 'name': movie_title },
      success: function (recs) {
        if (recs.includes("Sorry!")) {
          $('.fail').show();
          $('.results').hide();
          $("#loader").delay(500).fadeOut();
        } else {
          $('.fail').hide();
          $('.results').show();
          const movie_arr = recs.split('---');
          get_movie_details(movie_id, my_api_key, movie_arr, movie_title);
        }
      },
      error: function () {
        alert("Error in recommendations");
        $("#loader").delay(500).fadeOut();
      },
    });
  }
  
  function get_movie_details(movie_id, my_api_key, arr, movie_title) {
    $.ajax({
      type: 'GET',
      url: 'https://api.themoviedb.org/3/movie/' + movie_id + '?api_key=' + my_api_key,
      success: function (movie_details) {
        show_details(movie_details, arr, movie_title, my_api_key, movie_id);
      },
      error: function () {
        alert("API Error!");
        $("#loader").delay(500).fadeOut();
      },
    });
  }
  
  function show_details(movie_details, arr, movie_title, my_api_key, movie_id) {
    const imdb_id = movie_details.imdb_id;
    const poster = 'https://image.tmdb.org/t/p/original' + movie_details.poster_path;
    const overview = movie_details.overview;
    const genres = movie_details.genres;
    const rating = movie_details.vote_average;
    const vote_count = movie_details.vote_count;
    const release_date = new Date(movie_details.release_date);
    const runtime = parseInt(movie_details.runtime);
    const status = movie_details.status;
  
    const genre_list = [];
    for (const genre of genres) {
      genre_list.push(genre.name);
    }
  
    // You can continue using the extracted data as needed here.
    // For example: populate the UI with movie details.
  }
  
  // ===== Helper Functions =====
  
  function get_individual_cast(movie_cast, my_api_key) {
    const cast_bdays = [];
    const cast_bios = [];
    const cast_places = [];
  
    for (const cast_id of movie_cast.cast_ids) {
      $.ajax({
        type: 'GET',
        url: 'https://api.themoviedb.org/3/person/' + cast_id + '?api_key=' + my_api_key,
        async: false, // Still synchronous, consider refactoring later
        success: function (cast_details) {
          cast_bdays.push((new Date(cast_details.birthday)).toDateString().split(' ').slice(1).join(' '));
          cast_bios.push(cast_details.biography);
          cast_places.push(cast_details.place_of_birth);
        }
      });
    }
  
    return { cast_bdays, cast_bios, cast_places };
  }
  
  function get_movie_cast(movie_id, my_api_key) {
    const cast_ids = [];
    const cast_names = [];
    const cast_chars = [];
    const cast_profiles = [];
  
    $.ajax({
      type: 'GET',
      url: "https://api.themoviedb.org/3/movie/" + movie_id + "/credits?api_key=" + my_api_key,
      async: false,
      success: function (my_movie) {
        const top_cast = my_movie.cast.slice(0, Math.min(10, my_movie.cast.length));
        for (const cast of top_cast) {
          cast_ids.push(cast.id);
          cast_names.push(cast.name);
          cast_chars.push(cast.character);
          cast_profiles.push("https://image.tmdb.org/t/p/original" + cast.profile_path);
        }
      },
      error: function () {
        alert("Invalid Request!");
        $("#loader").delay(500).fadeOut();
      }
    });
  
    return { cast_ids, cast_names, cast_chars, cast_profiles };
  }
  
  function get_movie_posters(arr, my_api_key) {
    const arr_poster_list = [];
    for (const movie_name of arr) {
      $.ajax({
        type: 'GET',
        url: 'https://api.themoviedb.org/3/search/movie?api_key=' + my_api_key + '&query=' + movie_name,
        async: false,
        success: function (m_data) {
          if (m_data.results.length > 0) {
            arr_poster_list.push('https://image.tmdb.org/t/p/original' + m_data.results[0].poster_path);
          }
        },
        error: function () {
          alert("Invalid Request!");
          $("#loader").delay(500).fadeOut();
        },
      });
    }
    return arr_poster_list;
  }
  