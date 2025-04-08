import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moviesReducer from './moviesSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, moviesReducer);

export const store = configureStore({
  reducer: {
    movies: persistedReducer,
  },
});

export const persistor = persistStore(store);
