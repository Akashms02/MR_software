import axios from "../../api/axiosInstance";
import { API_ROUTE } from "../../data/env";
import {
  FETCH_MY_TOUR_PLANS_REQUEST,
  FETCH_MY_TOUR_PLANS_SUCCESS,
  FETCH_MY_TOUR_PLANS_FAILURE,
  SAVE_TOUR_PLAN_DRAFT_REQUEST,
  SAVE_TOUR_PLAN_DRAFT_SUCCESS,
  SAVE_TOUR_PLAN_DRAFT_FAILURE,
  SUBMIT_TOUR_PLAN_REQUEST,
  SUBMIT_TOUR_PLAN_SUCCESS,
  SUBMIT_TOUR_PLAN_FAILURE,
  FETCH_TOUR_PLAN_DETAILS_REQUEST,
  FETCH_TOUR_PLAN_DETAILS_SUCCESS,
  FETCH_TOUR_PLAN_DETAILS_FAILURE,
  FETCH_TEAM_TOUR_PLANS_REQUEST,
  FETCH_TEAM_TOUR_PLANS_SUCCESS,
  FETCH_TEAM_TOUR_PLANS_FAILURE,
  REVIEW_TOUR_PLAN_REQUEST,
  REVIEW_TOUR_PLAN_SUCCESS,
  REVIEW_TOUR_PLAN_FAILURE,
  CLEAR_TOUR_PLAN_ERRORS,
  CLEAR_TOUR_PLAN_SUCCESS,
} from "../actionType/tourPlanActionType";
import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";

const commonError = "Something went wrong!";

export const fetchMyTourPlansAction = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_MY_TOUR_PLANS_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/tour-plan/me`);
    const payloadData = response.data?.data || response.data || [];
    dispatch({
      type: FETCH_MY_TOUR_PLANS_SUCCESS,
      payload: Array.isArray(payloadData) ? payloadData : [],
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_MY_TOUR_PLANS_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const saveTourPlanDraftAction = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: SAVE_TOUR_PLAN_DRAFT_REQUEST });
  try {
    const response = await axios.post(`${API_ROUTE}/tour-plan/draft`, payload);
    const payloadData = response.data?.data || response.data;
    dispatch({
      type: SAVE_TOUR_PLAN_DRAFT_SUCCESS,
      payload: payloadData,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: SAVE_TOUR_PLAN_DRAFT_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const submitTourPlanAction = (planId) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: SUBMIT_TOUR_PLAN_REQUEST });
  try {
    const response = await axios.post(`${API_ROUTE}/tour-plan/${planId}/submit`);
    dispatch({ type: SUBMIT_TOUR_PLAN_SUCCESS, payload: planId });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: SUBMIT_TOUR_PLAN_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const fetchTourPlanDetailsAction = (planId) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_TOUR_PLAN_DETAILS_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/tour-plan/${planId}`);
    const payloadData = response.data?.data || response.data;
    dispatch({
      type: FETCH_TOUR_PLAN_DETAILS_SUCCESS,
      payload: payloadData,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_TOUR_PLAN_DETAILS_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const fetchTeamTourPlansAction = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_TEAM_TOUR_PLANS_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/tour-plan/team`);
    const payloadData = response.data?.data || response.data || [];
    dispatch({
      type: FETCH_TEAM_TOUR_PLANS_SUCCESS,
      payload: Array.isArray(payloadData) ? payloadData : [],
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_TEAM_TOUR_PLANS_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const reviewTourPlanAction = (planId, status, remarks) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: REVIEW_TOUR_PLAN_REQUEST });
  try {
    const response = await axios.put(`${API_ROUTE}/tour-plan/${planId}/review?status=${status}&remarks=${encodeURIComponent(remarks || '')}`);
    dispatch({
      type: REVIEW_TOUR_PLAN_SUCCESS,
      payload: { planId, status, remarks },
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: REVIEW_TOUR_PLAN_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const clearTourPlanErrorsAction = () => (dispatch) => {
  dispatch({ type: CLEAR_TOUR_PLAN_ERRORS });
};

export const clearTourPlanSuccessAction = () => (dispatch) => {
  dispatch({ type: CLEAR_TOUR_PLAN_SUCCESS });
};
