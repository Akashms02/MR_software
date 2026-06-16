import { combineReducers } from '@reduxjs/toolkit';
import { authReducer } from './authReducer';
import { adminReducer } from './adminReducer';
import { teamReducer } from './teamReducer';
import { companyReducer } from './companyReducer';
import { reportReducer } from './reportReducer';
import { dcrReducer } from './dcrReducer';
import { tourPlanReducer } from './tourPlanReducer';
import { leaveReducer } from './leaveReducer';
import { holidayReducer } from './holidayReducer';
import { requestReducer } from './requestReducer';
import { attendanceReducer } from './attendanceReducer';
import { notificationReducer } from './notificationReducer';
import { noticeReducer } from './noticeReducer';
import { documentReducer } from './documentReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  admin: adminReducer,
  team: teamReducer,
  company: companyReducer,
  reports: reportReducer,
  dcr: dcrReducer,
  tourPlan: tourPlanReducer,
  leave: leaveReducer,
  holiday: holidayReducer,
  request: requestReducer,
  attendance: attendanceReducer,
  notification: notificationReducer,
  notices: noticeReducer,
  document: documentReducer,
});

export default rootReducer;
