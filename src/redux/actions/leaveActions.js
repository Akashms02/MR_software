import axios from "../../api/axiosInstance";
import { API_ROUTE } from "../../data/env";
import {
  FETCH_MY_LEAVES_REQUEST,
  FETCH_MY_LEAVES_SUCCESS,
  FETCH_MY_LEAVES_FAILURE,
  APPLY_LEAVE_REQUEST,
  APPLY_LEAVE_SUCCESS,
  APPLY_LEAVE_FAILURE,
  FETCH_TEAM_LEAVES_REQUEST,
  FETCH_TEAM_LEAVES_SUCCESS,
  FETCH_TEAM_LEAVES_FAILURE,
  REVIEW_LEAVE_REQUEST,
  REVIEW_LEAVE_SUCCESS,
  REVIEW_LEAVE_FAILURE,
  CLEAR_LEAVE_ERRORS,
  CLEAR_LEAVE_SUCCESS,
} from "../actionType/leaveActionType";
import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";

const commonError = "Something went wrong!";

export const fetchMyLeavesAction = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_MY_LEAVES_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/leaves/me`);
    const payloadData = response.data?.data || response.data || [];
    dispatch({
      type: FETCH_MY_LEAVES_SUCCESS,
      payload: Array.isArray(payloadData) ? payloadData : [],
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_MY_LEAVES_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const applyLeaveAction = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: APPLY_LEAVE_REQUEST });
  try {
    console.log("Applying leave. URL:", `${API_ROUTE}/leaves/apply`, "Payload:", JSON.stringify(payload));
    const response = await axios.post(`${API_ROUTE}/leaves/apply`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const payloadData = response.data?.data || response.data;
    dispatch({
      type: APPLY_LEAVE_SUCCESS,
      payload: payloadData,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: APPLY_LEAVE_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const fetchTeamLeavesAction = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_TEAM_LEAVES_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/leaves/team`);
    const payloadData = response.data?.data || response.data || [];
    dispatch({
      type: FETCH_TEAM_LEAVES_SUCCESS,
      payload: Array.isArray(payloadData) ? payloadData : [],
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_TEAM_LEAVES_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const reviewLeaveAction = (leaveId, status, remarks) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: REVIEW_LEAVE_REQUEST });
  try {
    const response = await axios.put(
      `${API_ROUTE}/leaves/${leaveId}/review?status=${status}&remarks=${encodeURIComponent(remarks || "")}`
    );
    dispatch({
      type: REVIEW_LEAVE_SUCCESS,
      payload: { leaveId, status, remarks },
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: REVIEW_LEAVE_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const clearLeaveErrorsAction = () => (dispatch) => {
  dispatch({ type: CLEAR_LEAVE_ERRORS });
};

export const clearLeaveSuccessAction = () => (dispatch) => {
  dispatch({ type: CLEAR_LEAVE_SUCCESS });
};
