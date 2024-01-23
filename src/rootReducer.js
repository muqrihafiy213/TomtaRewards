// rootReducer.js
import { combineReducers } from 'redux';
import pointsReducer from './pointsSlice';
import userReducer from './userSlice';

const rootReducer = combineReducers({
  points: pointsReducer,
  user: userReducer,
});

export default rootReducer;
