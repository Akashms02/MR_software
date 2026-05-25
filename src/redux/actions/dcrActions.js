import axios from "../../api/axiosInstance";
import { API_ROUTE } from "../../data/env";
import {
  FETCH_MY_DCRS_REQUEST,
  FETCH_MY_DCRS_SUCCESS,
  FETCH_MY_DCRS_FAILURE,
  SAVE_DCR_DRAFT_REQUEST,
  SAVE_DCR_DRAFT_SUCCESS,
  SAVE_DCR_DRAFT_FAILURE,
  SUBMIT_DCR_REQUEST,
  SUBMIT_DCR_SUCCESS,
  SUBMIT_DCR_FAILURE,
  FETCH_DCR_DETAILS_REQUEST,
  FETCH_DCR_DETAILS_SUCCESS,
  FETCH_DCR_DETAILS_FAILURE,
  CLEAR_DCR_ERRORS,
  CLEAR_DCR_SUCCESS,
  FETCH_TEAM_DCRS_REQUEST,
  FETCH_TEAM_DCRS_SUCCESS,
  FETCH_TEAM_DCRS_FAILURE,
  REVIEW_DCR_REQUEST,
  REVIEW_DCR_SUCCESS,
  REVIEW_DCR_FAILURE,
} from "../actionType/dcrActionType";
import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";

const commonError = "Something went wrong!";

export const fetchMyDcrsAction = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_MY_DCRS_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/dcr/me`);
    const payloadData = response.data?.data || response.data || [];
    dispatch({
      type: FETCH_MY_DCRS_SUCCESS,
      payload: Array.isArray(payloadData) ? payloadData : [],
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_MY_DCRS_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const saveDcrDraftAction = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: SAVE_DCR_DRAFT_REQUEST });
  try {
    const response = await axios.post(`${API_ROUTE}/dcr/draft`, payload);
    const payloadData = response.data?.data || response.data;
    dispatch({
      type: SAVE_DCR_DRAFT_SUCCESS,
      payload: payloadData,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: SAVE_DCR_DRAFT_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const submitDcrAction = (dcrId) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: SUBMIT_DCR_REQUEST });
  try {
    const response = await axios.post(`${API_ROUTE}/dcr/${dcrId}/submit`);
    dispatch({ type: SUBMIT_DCR_SUCCESS, payload: dcrId });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: SUBMIT_DCR_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const fetchDcrDetailsAction = (dcrId) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_DCR_DETAILS_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/dcr/${dcrId}`);
    const payloadData = response.data?.data || response.data;
    dispatch({
      type: FETCH_DCR_DETAILS_SUCCESS,
      payload: payloadData,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_DCR_DETAILS_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const clearDcrErrorsAction = () => (dispatch) => {
  dispatch({ type: CLEAR_DCR_ERRORS });
};

export const clearDcrSuccessAction = () => (dispatch) => {
  dispatch({ type: CLEAR_DCR_SUCCESS });
};

export const fetchTeamDcrsAction = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_TEAM_DCRS_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/dcr/team`);
    const payloadData = response.data?.data || response.data || [];
    dispatch({
      type: FETCH_TEAM_DCRS_SUCCESS,
      payload: Array.isArray(payloadData) ? payloadData : [],
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_TEAM_DCRS_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const reviewDcrAction = (dcrId, status, remarks) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: REVIEW_DCR_REQUEST });
  try {
    const response = await axios.put(`${API_ROUTE}/dcr/${dcrId}/review?status=${status}&remarks=${encodeURIComponent(remarks || '')}`);
    dispatch({
      type: REVIEW_DCR_SUCCESS,
      payload: { dcrId, status, remarks },
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: REVIEW_DCR_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};
