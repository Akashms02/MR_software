import axios from "../../api/axiosInstance";
import { API_ROUTE } from "../../data/env";
import {
  TEAM_LIST_REQUEST,
  TEAM_LIST_SUCCESS,
  TEAM_LIST_FAILURE,
  TEAM_ONBOARD_REQUEST,
  TEAM_ONBOARD_SUCCESS,
  TEAM_ONBOARD_FAILURE,
  DOCTOR_EXCEL_UPLOAD_REQUEST,
  DOCTOR_EXCEL_UPLOAD_SUCCESS,
  DOCTOR_EXCEL_UPLOAD_FAILURE,
  CHEMIST_EXCEL_UPLOAD_REQUEST,
  CHEMIST_EXCEL_UPLOAD_SUCCESS,
  CHEMIST_EXCEL_UPLOAD_FAILURE,
  CLEAR_ERRORS,
  CLEAR_SUCCESS
} from "../actionType/teamActionType";
import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";

const commonError = "Something went wrong!";
const isSuccess = (status) => status === 200 || status === 201 || status === "SUCCESS" || status === true;

/* =======================
   GET MY TEAM
 ======================= */
export const getMyTeam = (page = 0, size = 100000) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: TEAM_LIST_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/admin/my-team?page=${page}&size=${size}`);
    const { status, message, data } = response.data ?? {};

    if (isSuccess(status) || response.status === 200) {
      const rawData = data || response.data.data;
      const teamArray = Array.isArray(rawData) 
        ? rawData 
        : (rawData && Array.isArray(rawData.content) ? rawData.content : []);

      const totalElements = (rawData && rawData.totalElements !== undefined) ? rawData.totalElements : teamArray.length;
      const totalPages = (rawData && rawData.totalPages !== undefined) ? rawData.totalPages : 1;

      dispatch({
        type: TEAM_LIST_SUCCESS,
        payload: teamArray,
        totalElements,
        totalPages,
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

/* =======================
   UPLOAD DOCTOR EXCEL (Bulk Onboard)
   POST /api/v1/doctor/upload-excel
   Content-Type: multipart/form-data
   "multipart/form-data" means the request body carries binary file data
   alongside other fields — required for file uploads over HTTP.
 ======================= */
export const uploadDoctorExcel = (file) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: DOCTOR_EXCEL_UPLOAD_REQUEST });
  try {
    // FormData encodes the file as multipart/form-data automatically
    const formData = new FormData();
    formData.append('file', file);

    // axiosInstance already injects the Bearer token via its interceptor
    const response = await axios.post(
      `${API_ROUTE}/doctor/upload-excel`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    const resData = response?.data ?? {};
    const ok = resData?.status === true || resData?.status === 200 || resData?.status === 201
      || response?.status === 200 || response?.status === 201;

    if (ok) {
      dispatch({
        type: DOCTOR_EXCEL_UPLOAD_SUCCESS,
        payload: resData,
      });
      return { success: true, data: resData };
    }

    const errMsg = resData?.message || 'Excel upload failed.';
    dispatch({ type: DOCTOR_EXCEL_UPLOAD_FAILURE, payload: errMsg });
    return { success: false, message: errMsg };
  } catch (error) {
    // Surface the exact backend message (e.g. "duplicate entry" / constraint errors)
    const errMsg = error?.response?.data?.message || error?.message || 'Failed to upload Excel file.';
    dispatch({ type: DOCTOR_EXCEL_UPLOAD_FAILURE, payload: errMsg });
    return { success: false, message: errMsg };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

/* =======================
   UPLOAD CHEMIST EXCEL (Bulk Onboard)
   POST /api/v1/chemist/upload-excel
   Content-Type: multipart/form-data
 ======================= */
export const uploadChemistExcel = (file) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: CHEMIST_EXCEL_UPLOAD_REQUEST });
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
      `${API_ROUTE}/chemist/upload-excel`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    const resData = response?.data ?? {};
    const ok = resData?.status === true || resData?.status === 200 || resData?.status === 201
      || response?.status === 200 || response?.status === 201;

    if (ok) {
      dispatch({
        type: CHEMIST_EXCEL_UPLOAD_SUCCESS,
        payload: resData,
      });
      return { success: true, data: resData };
    }

    const errMsg = resData?.message || 'Excel upload failed.';
    dispatch({ type: CHEMIST_EXCEL_UPLOAD_FAILURE, payload: errMsg });
    return { success: false, message: errMsg };
  } catch (error) {
    const errMsg = error?.response?.data?.message || error?.message || 'Failed to upload Excel file.';
    dispatch({ type: CHEMIST_EXCEL_UPLOAD_FAILURE, payload: errMsg });
    return { success: false, message: errMsg };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

/* =======================
   FETCH ONBOARDING STATUS
   ======================= */
export const fetchOnboardingStatus = (employeeId) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const response = await axios.get(`${API_ROUTE}/admin/onboard/status/${employeeId}`);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || "Failed to fetch onboarding status";
    dispatch({ type: TEAM_ONBOARD_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

/* =======================
   SAVE ONBOARDING STEP
   ======================= */
export const saveOnboardingStep = (stepNumber, employeeId, payload, isMultipart = false) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: TEAM_ONBOARD_REQUEST });
  try {
    let url = `${API_ROUTE}/admin/onboard/step${stepNumber}`;
    if (stepNumber > 1) {
      url += `/${employeeId}`;
    }

    const config = isMultipart 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};

    const response = await axios.post(url, payload, config);
    const { status, message } = response.data ?? {};

    if (isSuccess(status) || response.status === 201 || response.status === 200) {
      dispatch({
        type: TEAM_ONBOARD_SUCCESS,
        payload: response.data,
      });
      // If it is the last step, refresh the team list
      if (stepNumber === 7) {
        dispatch(getMyTeam());
      }
      return response.data;
    }

    dispatch({
      type: TEAM_ONBOARD_FAILURE,
      payload: message || commonError,
    });
    throw new Error(message || commonError);
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({
      type: TEAM_ONBOARD_FAILURE,
      payload: msg,
    });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

/* =======================
   FETCH REPORTING MANAGERS
   ======================= */
export const fetchReportingManagers = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const response = await axios.get(`${API_ROUTE}/admin/reporting-managers`);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || "Failed to fetch reporting managers";
    throw new Error(msg, { cause: error });
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
   UPDATE ONBOARDING DETAILS
   ======================= */
export const updateOnboardingDetails = (employeeId, payload, isMultipart = false) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: TEAM_ONBOARD_REQUEST });
  try {
    const url = `${API_ROUTE}/admin/onboard/update/${employeeId}`;
    const config = isMultipart 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};

    const response = await axios.put(url, payload, config);
    const { status, message } = response.data ?? {};

    if (isSuccess(status) || response.status === 200 || response.status === 201) {
      dispatch({
        type: TEAM_ONBOARD_SUCCESS,
        payload: response.data,
      });
      // Refresh my team
      dispatch(getMyTeam());
      return response.data;
    }

    dispatch({
      type: TEAM_ONBOARD_FAILURE,
      payload: message || commonError,
    });
    throw new Error(message || commonError);
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({
      type: TEAM_ONBOARD_FAILURE,
      payload: msg,
    });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};
