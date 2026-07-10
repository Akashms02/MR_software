import axios from "../../api/axiosInstance";
import { API_ROUTE } from "../../data/env";
import {
  PUNCH_IN_REQUEST,
  PUNCH_IN_SUCCESS,
  PUNCH_IN_FAILURE,
  PUNCH_OUT_REQUEST,
  PUNCH_OUT_SUCCESS,
  PUNCH_OUT_FAILURE,
  FETCH_MY_ATTENDANCE_REQUEST,
  FETCH_MY_ATTENDANCE_SUCCESS,
  FETCH_MY_ATTENDANCE_FAILURE,
  FETCH_TEAM_ATTENDANCE_REQUEST,
  FETCH_TEAM_ATTENDANCE_SUCCESS,
  FETCH_TEAM_ATTENDANCE_FAILURE,
  LOCATION_CHECK_IN_REQUEST,
  LOCATION_CHECK_IN_SUCCESS,
  LOCATION_CHECK_IN_FAILURE,
  LOCATION_CHECK_OUT_REQUEST,
  LOCATION_CHECK_OUT_SUCCESS,
  LOCATION_CHECK_OUT_FAILURE,
  FETCH_MY_VISITS_REQUEST,
  FETCH_MY_VISITS_SUCCESS,
  FETCH_MY_VISITS_FAILURE,
  FETCH_TEAM_VISITS_REQUEST,
  FETCH_TEAM_VISITS_SUCCESS,
  FETCH_TEAM_VISITS_FAILURE,
} from "../actionType/attendanceActionType";
import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";
import {
  extractAttendanceList,
  extractVisitList,
  mergeAttendanceLists,
  mergeVisitLists,
  normalizeAttendanceRecord,
  normalizeVisitRecord,
} from "../../utils/attendanceUtils";

const commonError = "Something went wrong!";

export const punchInAction = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: PUNCH_IN_REQUEST });
  try {
    const response = await axios.post(`${API_ROUTE}/attendance/punch-in`, payload);
    const payloadData = normalizeAttendanceRecord(response.data?.data || response.data);
    dispatch({
      type: PUNCH_IN_SUCCESS,
      payload: payloadData,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: PUNCH_IN_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const punchOutAction = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: PUNCH_OUT_REQUEST });
  try {
    const response = await axios.post(`${API_ROUTE}/attendance/punch-out`, payload);
    const payloadData = normalizeAttendanceRecord(response.data?.data || response.data);
    dispatch({
      type: PUNCH_OUT_SUCCESS,
      payload: payloadData,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: PUNCH_OUT_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const fetchMyAttendanceAction = () => async (dispatch, getState) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_MY_ATTENDANCE_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/attendance/me`);
    const fetched = extractAttendanceList(response);
    const previous = getState().attendance?.myAttendance || [];
    const payloadData = mergeAttendanceLists(fetched, previous);
    dispatch({
      type: FETCH_MY_ATTENDANCE_SUCCESS,
      payload: payloadData,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_MY_ATTENDANCE_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const fetchTeamAttendanceAction = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_TEAM_ATTENDANCE_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/attendance/team`);
    const rawData = response.data?.data || response.data || [];
    const payloadData = Array.isArray(rawData) 
      ? rawData 
      : (rawData && Array.isArray(rawData.content) ? rawData.content : []);
    dispatch({
      type: FETCH_TEAM_ATTENDANCE_SUCCESS,
      payload: payloadData,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_TEAM_ATTENDANCE_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const locationCheckInAction = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: LOCATION_CHECK_IN_REQUEST });
  try {
    const response = await axios.post(`${API_ROUTE}/attendance/location/check-in`, payload);
    const payloadData = normalizeVisitRecord(response.data?.data || response.data);
    dispatch({
      type: LOCATION_CHECK_IN_SUCCESS,
      payload: payloadData,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: LOCATION_CHECK_IN_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const locationCheckOutAction = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: LOCATION_CHECK_OUT_REQUEST });
  try {
    const response = await axios.post(`${API_ROUTE}/attendance/location/check-out`, payload);
    const payloadData = normalizeVisitRecord(response.data?.data || response.data);
    dispatch({
      type: LOCATION_CHECK_OUT_SUCCESS,
      payload: payloadData,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: LOCATION_CHECK_OUT_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const fetchMyVisitsAction = () => async (dispatch, getState) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_MY_VISITS_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/attendance/location/me`);
    const fetched = extractVisitList(response);
    const previous = getState().attendance?.myVisits || [];
    const payloadData = mergeVisitLists(fetched, previous);
    dispatch({
      type: FETCH_MY_VISITS_SUCCESS,
      payload: payloadData,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_MY_VISITS_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const fetchTeamVisitsAction = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_TEAM_VISITS_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/attendance/location/team`);
    const rawData = response.data?.data || response.data || [];
    const payloadData = Array.isArray(rawData) 
      ? rawData 
      : (rawData && Array.isArray(rawData.content) ? rawData.content : []);
    dispatch({
      type: FETCH_TEAM_VISITS_SUCCESS,
      payload: payloadData,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_TEAM_VISITS_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};
