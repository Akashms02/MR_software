import axios from "../../api/axiosInstance";
import { API_ROUTE } from "../../data/env";
import {
  TEAM_LIST_REQUEST,
  TEAM_LIST_SUCCESS,
  TEAM_LIST_FAILURE,
  TEAM_ONBOARD_REQUEST,
  TEAM_ONBOARD_SUCCESS,
  TEAM_ONBOARD_FAILURE,
  CLEAR_ERRORS,
  CLEAR_SUCCESS
} from "../actionType/teamActionType";
import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";

const commonError = "Something went wrong!";
const isSuccess = (status) => status === 200 || status === 201 || status === "SUCCESS";

/* =======================
   GET MY TEAM
 ======================= */
export const getMyTeam = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: TEAM_LIST_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/admin/my-team`);
    const { status, message, data } = response.data ?? {};

    if (isSuccess(status) || response.status === 200) {
      dispatch({
        type: TEAM_LIST_SUCCESS,
        payload: data || response.data.data || [],
      });
      return response.data;
    }

    dispatch({
      type: TEAM_LIST_FAILURE,
      payload: message || commonError,
    });
  } catch (error) {
    dispatch({
      type: TEAM_LIST_FAILURE,
      payload: error.response?.data?.message || error.message || commonError,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

/* =======================
   ONBOARD TEAM MEMBER
 ======================= */
export const onboardMember = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: TEAM_ONBOARD_REQUEST });
  try {
    const response = await axios.post(`${API_ROUTE}/admin/onboard`, payload);
    const { status, message } = response.data ?? {};

    if (isSuccess(status) || response.status === 201 || response.status === 200) {
      dispatch({
        type: TEAM_ONBOARD_SUCCESS,
        payload: response.data,
      });
      // Refresh the team list after successful onboarding
      dispatch(getMyTeam());
      return { status: status || 'SUCCESS', message };
    }

    dispatch({
      type: TEAM_ONBOARD_FAILURE,
      payload: message || commonError,
    });
    return { status: 'FAILURE', message: message || commonError };
  } catch (error) {
    const message = error.response?.data?.message || error.message || commonError;
    dispatch({
      type: TEAM_ONBOARD_FAILURE,
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
