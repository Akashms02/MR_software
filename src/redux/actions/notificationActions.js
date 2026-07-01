import axios from "../../api/axiosInstance";
import { API_ROUTE } from "../../data/env";
import {
  FETCH_NOTIFICATIONS_REQUEST,
  FETCH_NOTIFICATIONS_SUCCESS,
  FETCH_NOTIFICATIONS_FAILURE,
  FETCH_UNREAD_NOTIFICATIONS_REQUEST,
  FETCH_UNREAD_NOTIFICATIONS_SUCCESS,
  FETCH_UNREAD_NOTIFICATIONS_FAILURE,
  FETCH_UNREAD_COUNT_REQUEST,
  FETCH_UNREAD_COUNT_SUCCESS,
  FETCH_UNREAD_COUNT_FAILURE,
  MARK_NOTIFICATION_READ_REQUEST,
  MARK_NOTIFICATION_READ_SUCCESS,
  MARK_NOTIFICATION_READ_FAILURE,
  MARK_ALL_READ_REQUEST,
  MARK_ALL_READ_SUCCESS,
  MARK_ALL_READ_FAILURE,
  DELETE_NOTIFICATION_REQUEST,
  DELETE_NOTIFICATION_SUCCESS,
  DELETE_NOTIFICATION_FAILURE,
  CLEAR_ERRORS,
  CLEAR_SUCCESS
} from "../actionType/notificationActionType";
import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";

const commonError = "Something went wrong!";
const isSuccess = (status) => 
  status === 200 || 
  status === 201 || 
  status === "SUCCESS" || 
  status === true || 
  status === "true";

/* ====================================
   FETCH ALL NOTIFICATIONS
   ==================================== */
export const getNotifications = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_NOTIFICATIONS_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/notifications`);
    const { status, data } = response.data ?? {};

    if (isSuccess(status) || response.status === 200) {
      const payloadData = Array.isArray(data) ? data : (Array.isArray(response.data?.data) ? response.data.data : []);
      dispatch({
        type: FETCH_NOTIFICATIONS_SUCCESS,
        payload: payloadData,
      });
      return response.data;
    }

    dispatch({
      type: FETCH_NOTIFICATIONS_FAILURE,
      payload: response.data?.message || commonError,
    });
  } catch (error) {
    dispatch({
      type: FETCH_NOTIFICATIONS_FAILURE,
      payload: error.response?.data?.message || error.message || commonError,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

/* ====================================
   FETCH UNREAD NOTIFICATIONS
   ==================================== */
export const getUnreadNotifications = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_UNREAD_NOTIFICATIONS_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/notifications/unread`);
    const { status, data } = response.data ?? {};

    if (isSuccess(status) || response.status === 200) {
      const payloadData = Array.isArray(data) ? data : (Array.isArray(response.data?.data) ? response.data.data : []);
      dispatch({
        type: FETCH_UNREAD_NOTIFICATIONS_SUCCESS,
        payload: payloadData,
      });
      return response.data;
    }

    dispatch({
      type: FETCH_UNREAD_NOTIFICATIONS_FAILURE,
      payload: response.data?.message || commonError,
    });
  } catch (error) {
    dispatch({
      type: FETCH_UNREAD_NOTIFICATIONS_FAILURE,
      payload: error.response?.data?.message || error.message || commonError,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

/* ====================================
   FETCH UNREAD COUNT
   ==================================== */
export const getUnreadCount = () => async (dispatch) => {
  dispatch({ type: FETCH_UNREAD_COUNT_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/notifications/unread-count`);
    const { status, data } = response.data ?? {};

    if (isSuccess(status) || response.status === 200) {
      // API might return count directly or inside data
      const count = typeof data === 'number' ? data : (typeof response.data.data === 'number' ? response.data.data : (response.data.count ?? response.data ?? 0));
      dispatch({
        type: FETCH_UNREAD_COUNT_SUCCESS,
        payload: count,
      });
      return count;
    }

    dispatch({
      type: FETCH_UNREAD_COUNT_FAILURE,
      payload: response.data?.message || commonError,
    });
  } catch (error) {
    dispatch({
      type: FETCH_UNREAD_COUNT_FAILURE,
      payload: error.response?.data?.message || error.message || commonError,
    });
  }
};

/* ====================================
   MARK NOTIFICATION AS READ
   ==================================== */
export const markNotificationAsRead = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: MARK_NOTIFICATION_READ_REQUEST });
  try {
    const response = await axios.put(`${API_ROUTE}/notifications/${id}/read`);
    const { status } = response.data ?? {};

    if (isSuccess(status) || response.status === 200) {
      dispatch({
        type: MARK_NOTIFICATION_READ_SUCCESS,
        payload: id,
      });
      // Refresh count and notifications
      dispatch(getUnreadCount());
      return response.data;
    }

    dispatch({
      type: MARK_NOTIFICATION_READ_FAILURE,
      payload: response.data?.message || commonError,
    });
  } catch (error) {
    dispatch({
      type: MARK_NOTIFICATION_READ_FAILURE,
      payload: error.response?.data?.message || error.message || commonError,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

/* ====================================
   MARK ALL AS READ
   ==================================== */
export const markAllNotificationsAsRead = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: MARK_ALL_READ_REQUEST });
  try {
    const response = await axios.put(`${API_ROUTE}/notifications/read-all`);
    const { status } = response.data ?? {};

    if (isSuccess(status) || response.status === 200) {
      dispatch({
        type: MARK_ALL_READ_SUCCESS,
      });
      // Refresh count
      dispatch(getUnreadCount());
      return response.data;
    }

    dispatch({
      type: MARK_ALL_READ_FAILURE,
      payload: response.data?.message || commonError,
    });
  } catch (error) {
    dispatch({
      type: MARK_ALL_READ_FAILURE,
      payload: error.response?.data?.message || error.message || commonError,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

/* ====================================
   DELETE A NOTIFICATION
   ==================================== */
export const deleteNotification = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: DELETE_NOTIFICATION_REQUEST });
  try {
    const response = await axios.delete(`${API_ROUTE}/notifications/${id}`);
    const { status } = response.data ?? {};

    if (isSuccess(status) || response.status === 200) {
      dispatch({
        type: DELETE_NOTIFICATION_SUCCESS,
        payload: id,
      });
      // Refresh count and notifications
      dispatch(getUnreadCount());
      return response.data;
    }

    dispatch({
      type: DELETE_NOTIFICATION_FAILURE,
      payload: response.data?.message || commonError,
    });
  } catch (error) {
    dispatch({
      type: DELETE_NOTIFICATION_FAILURE,
      payload: error.response?.data?.message || error.message || commonError,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// Clear Errors
export const clearErrors = () => (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });
};

// Clear Success
export const clearSuccess = () => (dispatch) => {
  dispatch({ type: CLEAR_SUCCESS });
};
