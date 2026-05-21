import axios from "../../api/axiosInstance";
import { API_ROUTE } from "../../data/env";
import {
  ADMIN_LIST_REQUEST,
  ADMIN_LIST_SUCCESS,
  ADMIN_LIST_FAILURE,
  ADMIN_REGISTER_REQUEST,
  ADMIN_REGISTER_SUCCESS,
  ADMIN_REGISTER_FAILURE,
  CLEAR_ERRORS,
  CLEAR_SUCCESS
} from "../actionType/adminActionType";
import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";

const commonError = "Something went wrong!";
const isSuccess = (status) => 
  status === 200 || 
  status === 201 || 
  status === "SUCCESS" || 
  status === true || 
  status === "true";

/* =======================
   LIST ADMINS
 ======================= */
export const getAdmins = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: ADMIN_LIST_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/admin/all-admins`);
    const { status, message, data } = response.data ?? {};

    if (isSuccess(status) || response.status === 200) {
      dispatch({
        type: ADMIN_LIST_SUCCESS,
        payload: data || response.data.data || [],
      });
      return response.data;
    }

    dispatch({
      type: ADMIN_LIST_FAILURE,
      payload: message || commonError,
    });
  } catch (error) {
    dispatch({
      type: ADMIN_LIST_FAILURE,
      payload: error.response?.data?.message || error.message || commonError,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

/* =======================
   REGISTER ADMIN
 ======================= */
export const registerAdmin = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: ADMIN_REGISTER_REQUEST });
  try {
    const response = await axios.post(`${API_ROUTE}/admin/register`, payload);
    const { status, message } = response.data ?? {};

    if (isSuccess(status) || response.status === 201 || response.status === 200) {
      dispatch({
        type: ADMIN_REGISTER_SUCCESS,
        payload: response.data,
      });
      // Refresh the admin list after successful registration
      dispatch(getAdmins());
      return { status: status || 'SUCCESS', message };
    }

    dispatch({
      type: ADMIN_REGISTER_FAILURE,
      payload: message || commonError,
    });
    return { status: 'FAILURE', message: message || commonError };
  } catch (error) {
    const message = error.response?.data?.message || error.message || commonError;
    dispatch({
      type: ADMIN_REGISTER_FAILURE,
      payload: message,
    });
    return { status: 'FAILURE', message };
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

/* =======================
   TOGGLE ADMIN STATUS
 ======================= */
export const toggleAdminStatus = (adminReferenceCode, enabled) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const response = await axios.put(`${API_ROUTE}/admin/${adminReferenceCode}/status?enabled=${enabled}`);
    const { status, message } = response.data ?? {};

    if (isSuccess(status) || response.status === 200) {
      dispatch(getAdmins());
      return { ok: true, message };
    }
    return { ok: false, message: message || commonError };
  } catch (error) {
    const message = error.response?.data?.message || error.message || commonError;
    return { ok: false, message };
  } finally {
    dispatch({ type: LOADING_END });
  }
};
