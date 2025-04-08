import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';

const API_KEY = '81b1cc283e1661e43da248d7d09aecb6';
const BASE_URL = 'https://api.themoviedb.org/3';

export const fetchPopularMovies = createAsyncThunk(
  'movies/fetchPopular',
  async (page = 1) => {
    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=fr-FR&page=${page}`,
    );
    if (!response.ok) throw new Error('Erreur de chargement');
    return await response.json();
  },
);

export const fetchTopRatedMovies = createAsyncThunk(
  'movies/fetchTopRated',
  async () => {
    const response = await fetch(
      `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=fr-FR`,
    );
    if (!response.ok) throw new Error('Erreur de chargement');
    return await response.json();
  },
);

const moviesSlice = createSlice({
  name: 'movies',
  initialState: {
    popular: [],
    topRated: [],
    currentPage: 1,
    totalPages: 1,
    loading: false,
    error: null,
  },
  reducers: {
    incrementPage: state => {
      state.currentPage += 1;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPopularMovies.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.popular =
          action.payload.page === 1
            ? action.payload.results
            : [...state.popular, ...action.payload.results];
        state.totalPages = action.payload.total_pages;
        state.currentPage = action.payload.page;
      })
      .addCase(fetchPopularMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchTopRatedMovies.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopRatedMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.topRated = action.payload.results;
      })
      .addCase(fetchTopRatedMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const {incrementPage} = moviesSlice.actions;
export default moviesSlice.reducer;
