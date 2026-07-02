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

const extractPagination = (data, page, size) => {
  if (!data || typeof data !== 'object') return null;
  if (data.paginator) {
    return {
      totalElements: data.paginator.itemCount,
      totalPages: data.paginator.pageCount,
      number: data.paginator.currentPage - 1,
      size: data.paginator.perPage,
      first: data.paginator.currentPage === 1,
      last: data.paginator.currentPage === data.paginator.pageCount
    };
  }
  if ('totalElements' in data) {
    return {
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      number: data.number,
      size: data.size,
      first: data.first,
      last: data.last
    };
  }
  if ('total' in data) {
    return {
      totalElements: data.total,
      totalPages: Math.ceil(data.total / size),
      number: page,
      size: size,
      first: page === 0,
      last: (page + 1) * size >= data.total
    };
  }
  return null;
};

export const fetchPendingRequestsAction = (status = "ALL", page = 0, size = 10) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_PENDING_REQUESTS_REQUEST });
  try {
    const apiStatus = String(status || "ALL").toUpperCase();
    const response = await axios.get(`${API_ROUTE}/requests/pending`, {
      params: { status: apiStatus, page, size },
    });
    
    const data = response.data?.data ?? response.data;
    const list = Array.isArray(data) ? data : (data && Array.isArray(data.content) ? data.content : []);
    const pagination = extractPagination(data, page, size);

    dispatch({
      type: FETCH_PENDING_REQUESTS_SUCCESS,
      payload: list,
      pagination: pagination,
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

export const fetchMeRequestsAction = (page = 0, size = 10) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_ME_REQUESTS_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/requests/me`, {
      params: { page, size }
    });
    const rawData = response.data?.data || response.data;
    
    let list = [];
    let pagination = extractPagination(rawData, page, size);
    
    if (Array.isArray(rawData)) {
      list = rawData;
    } else if (rawData && typeof rawData === 'object') {
      list = Array.isArray(rawData.content) ? rawData.content : [];
    }

    dispatch({
      type: FETCH_ME_REQUESTS_SUCCESS,
      payload: list,
      pagination: pagination,
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
