import { combineReducers } from '@reduxjs/toolkit';
import { authReducer } from './authReducer';
import { adminReducer } from './adminReducer';
import { teamReducer } from './teamReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  admin: adminReducer,
  team: teamReducer,
});

export default rootReducer;
