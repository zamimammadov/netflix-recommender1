class MovieApp {
  constructor(apiKey) {
    this.apiKey   = apiKey;
    this.$input   = $('#autoComplete');
    this.$button  = $('.movie-button');
    this.$loader  = $('#loader');
    this.$fail    = $('.fail');
    this.$results = $('.results');
    this.$input.on('input', () =>
      this.$button.prop('disabled', !this.$input.val().trim())
    );
    this.$input.on('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();       // sayfa yenilemesin
        this.$button.click();     // mevcut click dinleyicisini tetikle
      }
    });
    this.$button.on('click', () => this.handleSearch());
  }
  toggleLoader(show) {
    show ? this.$loader.fadeIn() : this.$loader.fadeOut();
  }
  async handleSearch() {
    const title = this.$input.val().trim();
    if (!title) return;
    this.toggleLoader(true);           
    try {
      const { id, original_title } = await this.tmdbLookup(title);
      await this.fetchRecommendations(original_title, id);
    } catch (err) {
      console.error(err);
      this.showFail();
    } finally {
      this.toggleLoader(false);    
    }
  }
  async tmdbLookup(title) {
    const url =
      `https://api.themoviedb.org/3/search/movie?api_key=${this.apiKey}&query=` +
      encodeURIComponent(title);
    const { results } = await $.getJSON(url);
    if (!results.length) throw new Error('Movie not found');
    return results[0];
  }
  async fetchRecommendations(title, movieId) {
    const recs = await $.post('/similarity', { name: title });
    if (recs.startsWith('Sorry')) return this.showFail();
    const recArr  = recs.split('---');
    const details = await this.tmdbMovieDetails(movieId);
    const posters = await this.getMoviePosters(recArr);
    const cast    = await this.getMovieCast(movieId);
    const indCast = await this.getIndividualCast(cast.cast_ids);
    const payload = this.buildPayload(
      details, title, recArr, posters, cast, indCast
    );
    const html = await $.post('/recommend', payload, null, 'html');
    this.$results.html(html).show();
    this.$fail.hide();
    $(window).scrollTop(0);
  }
  async tmdbMovieDetails(id) {
    const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${this.apiKey}`;
    return $.getJSON(url);
  }
  async getMovieCast(movieId) {
    const url =
      `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${this.apiKey}`;
    const { cast } = await $.getJSON(url);
    const top = cast.slice(0, cast.length >= 10 ? 10 : 5);
    return {
      cast_ids:      top.map(c => c.id),
      cast_names:    top.map(c => c.name),
      cast_chars:    top.map(c => c.character),
      cast_profiles: top.map(c =>
        `https://image.tmdb.org/t/p/original${c.profile_path}`)
    };
  }
  async getIndividualCast(ids) {
    const bdays = [], bios = [], places = [];
    for (const id of ids) {
      const url =
        `https://api.themoviedb.org/3/person/${id}?api_key=${this.apiKey}`;
      const d = await $.getJSON(url);
      bdays.push(
        new Date(d.birthday).toDateString().split(' ').slice(1).join(' ')
      );
      bios.push(d.biography);
      places.push(d.place_of_birth);
    }
    return { cast_bdays: bdays, cast_bios: bios, cast_places: places };
  }
  async getMoviePosters(arr) {
    const posters = [];
    for (const title of arr) {
      const url =
        `https://api.themoviedb.org/3/search/movie?api_key=${this.apiKey}&query=` +
        encodeURIComponent(title);
      const { results } = await $.getJSON(url);
      posters.push(
        `https://image.tmdb.org/t/p/original${results[0].poster_path}`
      );
    }
    return posters;
  }
  buildPayload(d, title, recArr, posters, cast, indCast) {
    const runtimeH = Math.floor(d.runtime / 60);
    const runtimeM = d.runtime % 60;
    const runtime =
      runtimeM === 0
        ? `${runtimeH} hour(s)`
        : `${runtimeH} hour(s) ${runtimeM} min(s)`;
    return {
      title,
      imdb_id: d.imdb_id,
      poster: `https://image.tmdb.org/t/p/original${d.poster_path}`,
      overview: d.overview,
      genres: d.genres.map(g => g.name).join(', '),
      rating: d.vote_average,
      vote_count: d.vote_count.toLocaleString(),
      release_date: new Date(d.release_date)
        .toDateString()
        .split(' ')
        .slice(1)
        .join(' '),
      runtime,
      status: d.status,
      rec_movies: JSON.stringify(recArr),
      rec_posters: JSON.stringify(posters),
      cast_ids:      JSON.stringify(cast.cast_ids),
      cast_names:    JSON.stringify(cast.cast_names),
      cast_chars:    JSON.stringify(cast.cast_chars),
      cast_profiles: JSON.stringify(cast.cast_profiles),
      cast_bdays:    JSON.stringify(indCast.cast_bdays),
      cast_bios:     JSON.stringify(indCast.cast_bios),
      cast_places:   JSON.stringify(indCast.cast_places)
    };
  }
  showFail() {
    this.$fail.show();
    this.$results.hide();
    this.toggleLoader(false);
  }
}
$(function () {
  const TMDB_KEY = '7fee067b60fd14ed0bd0013b0863045f'; // kendi anahtarınız
  new MovieApp(TMDB_KEY);
});
