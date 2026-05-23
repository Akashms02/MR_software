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
} from "../actionType/reportActionType";
import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";

const commonError = "Something went wrong!";
const isSuccess = (status) => status === 200 || status === 201 || status === "SUCCESS";

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
      dispatch({
        type: GET_VISIT_SUMMARY_SUCCESS,
        payload: data || response.data,
      });
      return { success: true, data: data || response.data };
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
      dispatch({
        type: GET_DATEWISE_DAILY_SUCCESS,
        payload: data || response.data,
      });
      return { success: true, data: data || response.data };
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
      dispatch({
        type: GET_CALL_VISIT_SUCCESS,
        payload: data || response.data,
      });
      return { success: true, data: data || response.data };
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
      dispatch({
        type: GET_DCR_DAY_SUCCESS,
        payload: data || response.data,
      });
      return { success: true, data: data || response.data };
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
      dispatch({
        type: GET_DAILY_ACTIVITY_SUCCESS,
        payload: data || response.data,
      });
      return { success: true, data: data || response.data };
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
      dispatch({
        type: GET_WEEKLY_CROSS_SUCCESS,
        payload: data || response.data,
      });
      return { success: true, data: data || response.data };
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
