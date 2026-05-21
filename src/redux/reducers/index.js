import { combineReducers } from '@reduxjs/toolkit';
import { authReducer } from './authReducer';
import { adminReducer } from './adminReducer';
import { teamReducer } from './teamReducer';
import { companyReducer } from './companyReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  admin: adminReducer,
  team: teamReducer,
  company: companyReducer,
});

export default rootReducer;
