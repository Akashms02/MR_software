import { combineReducers } from '@reduxjs/toolkit';
import { authReducer } from './authReducer';
import { adminReducer } from './adminReducer';
import { teamReducer } from './teamReducer';
import { companyReducer } from './companyReducer';
import { reportReducer } from './reportReducer';
import { dcrReducer } from './dcrReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  admin: adminReducer,
  team: teamReducer,
  company: companyReducer,
  reports: reportReducer,
  dcr: dcrReducer,
});

export default rootReducer;
