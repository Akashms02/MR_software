import axios from "../../api/axiosInstance";
import { API_ROUTE } from "../../data/env";
import {
  GET_VISIT_SUMMARY_REQUEST,
  GET_VISIT_SUMMARY_SUCCESS,
  GET_VISIT_SUMMARY_FAILURE,
  GET_DATEWISE_DAILY_REQUEST,
  GET_DATEWISE_DAILY_SUCCESS,
  GET_DATEWISE_DAILY_FAILURE,
  GET_CALL_VISIT_REQUEST,
  GET_CALL_VISIT_SUCCESS,
  GET_CALL_VISIT_FAILURE,
  GET_DCR_DAY_REQUEST,
  GET_DCR_DAY_SUCCESS,
  GET_DCR_DAY_FAILURE,
  GET_DAILY_ACTIVITY_REQUEST,
  GET_DAILY_ACTIVITY_SUCCESS,
  GET_DAILY_ACTIVITY_FAILURE,
  GET_WEEKLY_CROSS_REQUEST,
  GET_WEEKLY_CROSS_SUCCESS,
  GET_WEEKLY_CROSS_FAILURE,
  CLEAR_REPORT_ERRORS,
  DISTRIBUTES_REPORT_REQUEST,
  DISTRIBUTES_REPORT_FAILURE,
  DISTRIBUTES_REPORT_SUCCESS,
  GET_DISTRIBUTORS_REQUEST,
  GET_DISTRIBUTORS_SUCCESS,
  GET_DISTRIBUTORS_FAILURE,
} from "../actionType/reportActionType";
import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";

const commonError = "Something went wrong!";
const isSuccess = (status) => status === 200 || status === 201 || status === "SUCCESS" || status === true;

export const clearReportErrors = () => (dispatch) => {
  dispatch({ type: CLEAR_REPORT_ERRORS });
};

// 1. Visit Summary
export const getVisitSummary = (mrId, startDate, endDate) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: GET_VISIT_SUMMARY_REQUEST });
  try {
    const response = await axios.get(
      `${API_ROUTE}/reports/visit-summary/${mrId}?startDate=${startDate}&endDate=${endDate}`
    );
    const { status, message, data } = response.data ?? {};
    if (isSuccess(status) || response.status === 200) {
      const totalWorkingDays = data?.data?.totalWorkingDays || 0;
      const totalVisits = data?.data?.totalVisits || 0;
      const uniqueDoctorsVisited = data?.data?.uniqueDoctorsVisited || 0;

      const formatted = {
        totalWorkingDays,
        totalVisits,
        uniqueDoctorsVisited,
        totalPlanned: totalWorkingDays, // map to planned card
        totalCompleted: totalVisits,    // map to completed card
        successRate: totalWorkingDays ? `${Math.round((totalVisits / totalWorkingDays) * 100)}%` : '0%',
        territories: [] // no territory breakdown in live API, empty to hide cleanly
      };

      dispatch({
        type: GET_VISIT_SUMMARY_SUCCESS,
        payload: formatted,
      });
      return { success: true, data: formatted };
    }
    dispatch({
      type: GET_VISIT_SUMMARY_FAILURE,
      payload: message || commonError,
    });
    return { success: false, error: message || commonError };
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: GET_VISIT_SUMMARY_FAILURE, payload: errMsg });
    return { success: false, error: errMsg };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 2. Datewise Daily Report
export const getDatewiseDaily = (mrId, startDate, endDate) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: GET_DATEWISE_DAILY_REQUEST });
  try {
    const response = await axios.get(
      `${API_ROUTE}/reports/datewise-daily/${mrId}?startDate=${startDate}&endDate=${endDate}`
    );
    const { status, message, data } = response.data ?? {};
    if (isSuccess(status) || response.status === 200) {
      const datewiseVisits = data?.data?.datewiseVisits || {};
      const formatted = Object.entries(datewiseVisits).map(([dateVal, visits]) => ({
        date: dateVal,
        visits: visits || 0,
        chemistCalls: 0,
        calls: visits || 0, // doctor calls fallback to visits
        travelKm: 0
      })).sort((a, b) => b.date.localeCompare(a.date));

      dispatch({
        type: GET_DATEWISE_DAILY_SUCCESS,
        payload: formatted,
      });
      return { success: true, data: formatted };
    }
    dispatch({
      type: GET_DATEWISE_DAILY_FAILURE,
      payload: message || commonError,
    });
    return { success: false, error: message || commonError };
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: GET_DATEWISE_DAILY_FAILURE, payload: errMsg });
    return { success: false, error: errMsg };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 3. Call Visit Report
export const getCallVisit = (mrId, startDate, endDate) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: GET_CALL_VISIT_REQUEST });
  try {
    const response = await axios.get(
      `${API_ROUTE}/reports/call-visit/${mrId}?startDate=${startDate}&endDate=${endDate}`
    );
    const { status, message, data } = response.data ?? {};
    if (isSuccess(status) || response.status === 200) {
      const formatted = data?.data?.calls || [];
      dispatch({
        type: GET_CALL_VISIT_SUCCESS,
        payload: formatted,
      });
      return { success: true, data: formatted };
    }
    dispatch({
      type: GET_CALL_VISIT_FAILURE,
      payload: message || commonError,
    });
    return { success: false, error: message || commonError };
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: GET_CALL_VISIT_FAILURE, payload: errMsg });
    return { success: false, error: errMsg };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 4. DCR Day Report
export const getDcrDay = (mrId, date) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: GET_DCR_DAY_REQUEST });
  try {
    const response = await axios.get(
      `${API_ROUTE}/reports/dcr-day/${mrId}?date=${date}`
    );
    const { status, message, data } = response.data ?? {};
    if (isSuccess(status) || response.status === 200) {
      const formatted = {
        date: data?.startDate || date,
        status: data?.data?.status || 'NO_REPORT',
        totalVisits: data?.data?.totalVisits || 0,
        approvedBy: data?.data?.approvedBy || 'Pending',
        comments: data?.data?.comments || '',
        expenses: data?.data?.expenses || null,
        doctorsMet: data?.data?.doctorsMet || []
      };
      dispatch({
        type: GET_DCR_DAY_SUCCESS,
        payload: formatted,
      });
      return { success: true, data: formatted };
    }
    dispatch({
      type: GET_DCR_DAY_FAILURE,
      payload: message || commonError,
    });
    return { success: false, error: message || commonError };
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: GET_DCR_DAY_FAILURE, payload: errMsg });
    return { success: false, error: errMsg };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 5. Daily Activity Summary
export const getDailyActivity = (mrId, date) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: GET_DAILY_ACTIVITY_REQUEST });
  try {
    const response = await axios.get(
      `${API_ROUTE}/reports/daily-activity/${mrId}?date=${date}`
    );
    const { status, message, data } = response.data ?? {};
    if (isSuccess(status) || response.status === 200) {
      const formatted = {
        date: data?.startDate || date,
        plannedTerritory: data?.data?.plannedTerritory || 'N/A',
        tourPlanStatus: data?.data?.tourPlanStatus || 'N/A',
        summary: {
          workingStatus: data?.data?.totalVisits > 0 ? 'Present' : 'Absent/No Activity',
          totalVisits: data?.data?.totalVisits || 0,
          productiveVisits: data?.data?.totalVisits || 0,
          nonProductiveVisits: 0,
          remarks: data?.data?.remarks || ''
        }
      };
      dispatch({
        type: GET_DAILY_ACTIVITY_SUCCESS,
        payload: formatted,
      });
      return { success: true, data: formatted };
    }
    dispatch({
      type: GET_DAILY_ACTIVITY_FAILURE,
      payload: message || commonError,
    });
    return { success: false, error: message || commonError };
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: GET_DAILY_ACTIVITY_FAILURE, payload: errMsg });
    return { success: false, error: errMsg };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 6. Weekly Cross Report
export const getWeeklyCross = (mrId, dateInWeek) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: GET_WEEKLY_CROSS_REQUEST });
  try {
    const response = await axios.get(
      `${API_ROUTE}/reports/weekly-cross/${mrId}?dateInWeek=${dateInWeek}`
    );
    const { status, message, data } = response.data ?? {};
    if (isSuccess(status) || response.status === 200) {
      const daysMap = {
        "MONDAY": "Monday",
        "TUESDAY": "Tuesday",
        "WEDNESDAY": "Wednesday",
        "THURSDAY": "Thursday",
        "FRIDAY": "Friday",
        "SATURDAY": "Saturday",
        "SUNDAY": "Sunday"
      };
      const formatted = Object.entries(data?.data?.weeklyMatrix || {}).map(([dayKey, visits]) => ({
        day: daysMap[dayKey] || dayKey,
        territory: 'N/A',
        doctorVisits: visits || 0,
        chemistCalls: 0,
        dcrStatus: visits > 0 ? 'COMPLETED' : 'NO_ACTIVITY'
      }));

      dispatch({
        type: GET_WEEKLY_CROSS_SUCCESS,
        payload: formatted,
      });
      return { success: true, data: formatted };
    }
    dispatch({
      type: GET_WEEKLY_CROSS_FAILURE,
      payload: message || commonError,
    });
    return { success: false, error: message || commonError };
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: GET_WEEKLY_CROSS_FAILURE, payload: errMsg });
    return { success: false, error: errMsg };
  } finally {
    dispatch({ type: LOADING_END });
  }
};


export const distributerActivityReport = (params) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: DISTRIBUTES_REPORT_REQUEST });
  try {
    const response = await axios.get(
      `${API_ROUTE}/mr/distributors/sales`,
      { params }
    );
    const { status, message, data } = response.data ?? {};
    if (isSuccess(status) || response.status === 200) {
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.content)) {
        list = data.content;
      } else if (data && Array.isArray(data.data)) {
        list = data.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        list = response.data.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data.content)) {
        list = response.data.data.content;
      }

      dispatch({
        type: DISTRIBUTES_REPORT_SUCCESS,
        payload: list,
      });
      return { success: true, data: list };
    }
    dispatch({
      type: DISTRIBUTES_REPORT_FAILURE,
      payload: message || commonError,
    });
    return { success: false, error: message || commonError };
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: DISTRIBUTES_REPORT_FAILURE, payload: errMsg });
    return { success: false, error: errMsg };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const getDistributorsList = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: GET_DISTRIBUTORS_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/mr/distributors`);
    const { status, message, data } = response.data ?? {};
    if (isSuccess(status) || response.status === 200) {
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.content)) {
        list = data.content;
      } else if (data && Array.isArray(data.data)) {
        list = data.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        list = response.data.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data.content)) {
        list = response.data.data.content;
      }

      dispatch({
        type: GET_DISTRIBUTORS_SUCCESS,
        payload: list,
      });
      return { success: true, data: list };
    }
    dispatch({
      type: GET_DISTRIBUTORS_FAILURE,
      payload: message || commonError,
    });
    return { success: false, error: message || commonError };
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: GET_DISTRIBUTORS_FAILURE, payload: errMsg });
    return { success: false, error: errMsg };
  } finally {
    dispatch({ type: LOADING_END });
  }
};