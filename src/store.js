// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from './rootReducer'
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';


const persistConfig = {
  key: 'root',
  storage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

 const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production',
  
})

export const persistor = persistStore(store);
export { store };