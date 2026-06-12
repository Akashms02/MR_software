import axios from "../../api/axiosInstance";
import { API_ROUTE } from "../../data/env";
import * as types from "../actionType/noticeActionType";
import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";

const commonError = "Something went wrong!";

// Convert YYYY-MM-DD to DD-MM-YYYY
const formatExpiryDateForAPI = (dateStr) => {
  if (dateStr && dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }
  return dateStr;
};

// 1. GET /api/v1/notices/active
export const getActiveNotices = () => async (dispatch) => {
  dispatch({ type: types.GET_ACTIVE_NOTICES_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/notices/active`);
    const payloadData = response.data?.data || response.data || [];
    dispatch({
      type: types.GET_ACTIVE_NOTICES_SUCCESS,
      payload: Array.isArray(payloadData) ? payloadData : [],
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: types.GET_ACTIVE_NOTICES_FAILURE, payload: msg });
    throw new Error(msg);
  }
};

// 2. GET /api/v1/notices
export const getAdminNotices = () => async (dispatch) => {
  dispatch({ type: types.GET_NOTICES_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/notices`);
    const payloadData = response.data?.data || response.data || [];
    dispatch({
      type: types.GET_NOTICES_SUCCESS,
      payload: Array.isArray(payloadData) ? payloadData : [],
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: types.GET_NOTICES_FAILURE, payload: msg });
    throw new Error(msg);
  }
};

// 3. POST /api/v1/notices
export const createNotice = (data) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: types.CREATE_NOTICE_REQUEST });
  try {
    const payload = { ...data };
    payload.expiryDate = formatExpiryDateForAPI(payload.expiryDate);

    const response = await axios.post(`${API_ROUTE}/notices`, payload);
    const payloadData = response.data?.data || response.data;
    
    dispatch({
      type: types.CREATE_NOTICE_SUCCESS,
      payload: payloadData,
    });
    dispatch(getAdminNotices());
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: types.CREATE_NOTICE_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 4. PUT /api/v1/notices/{id}
export const updateNotice = (id, data) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: types.UPDATE_NOTICE_REQUEST });
  try {
    const payload = { ...data };
    payload.expiryDate = formatExpiryDateForAPI(payload.expiryDate);

    const response = await axios.put(`${API_ROUTE}/notices/${id}`, payload);
    const payloadData = response.data?.data || response.data;

    dispatch({
      type: types.UPDATE_NOTICE_SUCCESS,
      payload: payloadData,
    });
    dispatch(getAdminNotices());
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: types.UPDATE_NOTICE_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 5. PATCH /api/v1/notices/{id}/toggle-active
export const toggleActiveNotice = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: types.TOGGLE_ACTIVE_NOTICE_REQUEST });
  try {
    const response = await axios.patch(`${API_ROUTE}/notices/${id}/toggle-active`);
    const payloadData = response.data?.data || response.data;

    dispatch({
      type: types.TOGGLE_ACTIVE_NOTICE_SUCCESS,
      payload: payloadData,
    });
    dispatch(getAdminNotices());
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: types.TOGGLE_ACTIVE_NOTICE_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 6. DELETE /api/v1/notices/{id}
export const deleteNotice = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: types.DELETE_NOTICE_REQUEST });
  try {
    const response = await axios.delete(`${API_ROUTE}/notices/${id}`);
    dispatch({
      type: types.DELETE_NOTICE_SUCCESS,
      payload: id,
    });
    dispatch(getAdminNotices());
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: types.DELETE_NOTICE_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const clearNoticeErrors = () => (dispatch) => {
  dispatch({ type: types.CLEAR_NOTICE_ERRORS });
};

export const clearNoticeSuccess = () => (dispatch) => {
  dispatch({ type: types.CLEAR_NOTICE_SUCCESS });
};
