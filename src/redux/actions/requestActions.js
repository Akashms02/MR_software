import axios from "../../api/axiosInstance";
import { API_ROUTE } from "../../data/env";
import {
  FETCH_PENDING_REQUESTS_REQUEST,
  FETCH_PENDING_REQUESTS_SUCCESS,
  FETCH_PENDING_REQUESTS_FAILURE,
  FETCH_ME_REQUESTS_REQUEST,
  FETCH_ME_REQUESTS_SUCCESS,
  FETCH_ME_REQUESTS_FAILURE,
  SUBMIT_ONBOARDING_REQUEST_REQUEST,
  SUBMIT_ONBOARDING_REQUEST_SUCCESS,
  SUBMIT_ONBOARDING_REQUEST_FAILURE,
  REVIEW_ONBOARDING_REQUEST_REQUEST,
  REVIEW_ONBOARDING_REQUEST_SUCCESS,
  REVIEW_ONBOARDING_REQUEST_FAILURE,
  UPDATE_DOCTOR_LOCATION_REQUEST,
  UPDATE_DOCTOR_LOCATION_SUCCESS,
  UPDATE_DOCTOR_LOCATION_FAILURE,
} from "../actionType/requestActionType";
import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";

const commonError = "Something went wrong!";

/** UI tab label → GET /requests/pending?status= */
export const requestStatusFromTab = (tab) => {
  const key = String(tab || "All").toUpperCase();
  if (key === "PENDING") return "PENDING";
  if (key === "APPROVED") return "APPROVED";
  if (key === "REJECTED") return "REJECTED";
  return "ALL";
};

const extractRequestList = (response) => {
  const data = response.data?.data ?? response.data;
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  return [];
};

export const fetchPendingRequestsAction = (status = "ALL") => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_PENDING_REQUESTS_REQUEST });
  try {
    const apiStatus = String(status || "ALL").toUpperCase();
    const response = await axios.get(`${API_ROUTE}/requests/pending`, {
      params: { status: apiStatus },
    });
    const list = extractRequestList(response);

    dispatch({
      type: FETCH_PENDING_REQUESTS_SUCCESS,
      payload: list,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_PENDING_REQUESTS_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const fetchMeRequestsAction = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_ME_REQUESTS_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/requests/me`);
    const rawData = response.data?.data || response.data;
    const list = Array.isArray(rawData) 
      ? rawData 
      : (rawData && Array.isArray(rawData.content) ? rawData.content : []);
    dispatch({
      type: FETCH_ME_REQUESTS_SUCCESS,
      payload: list,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_ME_REQUESTS_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const submitOnboardingRequestAction = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: SUBMIT_ONBOARDING_REQUEST_REQUEST });
  try {
    const response = await axios.post(`${API_ROUTE}/requests`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const payloadData = response.data?.data || response.data;
    dispatch({
      type: SUBMIT_ONBOARDING_REQUEST_SUCCESS,
      payload: payloadData,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: SUBMIT_ONBOARDING_REQUEST_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const reviewOnboardingRequestAction = (request, reviewStatus, remarks) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: REVIEW_ONBOARDING_REQUEST_REQUEST });
  try {
    const response = await axios.put(
      `${API_ROUTE}/requests/${request.id}/review?status=${reviewStatus}&remarks=${encodeURIComponent(remarks || "")}`
    );
    
    const updatedRequest = { ...request, status: reviewStatus, remarks };

    dispatch({
      type: REVIEW_ONBOARDING_REQUEST_SUCCESS,
      payload: updatedRequest,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: REVIEW_ONBOARDING_REQUEST_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const updateTargetLocationAction = (type, targetId, latitude, longitude) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: UPDATE_DOCTOR_LOCATION_REQUEST });
  try {
    const resource = String(type).toLowerCase() === 'chemist' ? 'chemist' : 'doctor';
    const response = await axios.put(
      `${API_ROUTE}/${resource}/${targetId}/location`,
      {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      }
    );
    dispatch({
      type: UPDATE_DOCTOR_LOCATION_SUCCESS,
      payload: { doctorId: targetId, latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || "Failed to update location!";
    dispatch({ type: UPDATE_DOCTOR_LOCATION_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};
