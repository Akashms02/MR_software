import axios from "../../api/axiosInstance";
import { API_ROUTE } from "../../data/env";
import { COMPANY_ACTIVE_DEATIVE_BUTTON_REQUEST_FAILURE, COMPANY_ACTIVE_DEATIVE_BUTTON_REQUEST_REQUEST, COMPANY_ACTIVE_DEATIVE_BUTTON_REQUEST_SUCCESS, COMPANY_EDIT_DATA_REQUEST_FAILURE, COMPANY_EDIT_DATA_REQUEST_REQUEST, COMPANY_EDIT_DATA_REQUEST_SUCCESS, COMPANY_GET_DEPARTMENTS_FAILURE, COMPANY_GET_DEPARTMENTS_REQUEST, COMPANY_GET_DEPARTMENTS_SUCCESS, COMPANY_GET_ROLES_FAILURE, COMPANY_GET_ROLES_REQUEST, COMPANY_GET_ROLES_SUCCESS, COMPANY_OFFER_LETTER_GENERATE_FAILURE, COMPANY_OFFER_LETTER_GENERATE_REQUEST, COMPANY_OFFER_LETTER_GENERATE_SUCCESS, COMPANY_PAYSLIP_GENERATE_FAILURE, COMPANY_PAYSLIP_GENERATE_REQUEST, COMPANY_PAYSLIP_GENERATE_SUCCESS, COMPANY_RELEIVING_LETTER_GENERATE_FAILURE, COMPANY_RELEIVING_LETTER_GENERATE_REQUEST, COMPANY_RELEIVING_LETTER_GENERATE_SUCCESS } from "../actionType/companyActionType";
import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";

const commonError = "Something went wrong!";
const isSuccess = (status) => status === 200 || status === 201 || status === "SUCCESS";


export const updateCompanyAccess = (adminId, enabled) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: COMPANY_ACTIVE_DEATIVE_BUTTON_REQUEST_REQUEST });
  try {
    const response = await axios.put(`${API_ROUTE}/admin/${adminId}/status?enabled=${enabled}`);
    const { status, message, data } = response.data ?? {};

    if (isSuccess(status) || response.status === 200) {
      dispatch({
        type: COMPANY_ACTIVE_DEATIVE_BUTTON_REQUEST_SUCCESS,
        payload: data || response.data.data || [],
      });
      return response.data;
    }

    dispatch({
      type: COMPANY_ACTIVE_DEATIVE_BUTTON_REQUEST_FAILURE,
      payload: message || commonError,
    });
  } catch (error) {
    dispatch({
      type: COMPANY_ACTIVE_DEATIVE_BUTTON_REQUEST_FAILURE,
      payload: error.response?.data?.message || error.message || commonError,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};


export const editCompanyData = (adminId, payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: COMPANY_EDIT_DATA_REQUEST_REQUEST });
  try {
    const config = payload instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const response = await axios.put(`${API_ROUTE}/admin/company/${adminId}`, payload, config);
    const { status, message, data } = response.data ?? {};

    if (isSuccess(status) || response.status === 200) {
      dispatch({
        type: COMPANY_EDIT_DATA_REQUEST_SUCCESS,
        payload: data || response.data.data || [],
      });
      return response.data;
    }

    dispatch({
      type: COMPANY_EDIT_DATA_REQUEST_FAILURE,
      payload: message || commonError,
    });
  } catch (error) {
    dispatch({
      type: COMPANY_EDIT_DATA_REQUEST_FAILURE,
      payload: error.response?.data?.message || error.message || commonError,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const CompanyOfferLetter = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: COMPANY_OFFER_LETTER_GENERATE_REQUEST });
  try {
    const config = payload instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const response = await axios.post(`${API_ROUTE}/admin/offer-letter/generate`, payload, config);
    const { status, message, data } = response.data ?? {};

    if (isSuccess(status) || response.status === 200) {
      dispatch({
        type: COMPANY_OFFER_LETTER_GENERATE_SUCCESS,
        payload: data || response.data.data || [],
      });
      return response.data;
    }

    dispatch({
      type: COMPANY_OFFER_LETTER_GENERATE_FAILURE,
      payload: message || commonError,
    });
  } catch (error) {
    dispatch({
      type: COMPANY_OFFER_LETTER_GENERATE_FAILURE,
      payload: error.response?.data?.message || error.message || commonError,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const CompanyPayslip = (employeeId, payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: COMPANY_PAYSLIP_GENERATE_REQUEST });
  try {
    const config = payload instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const response = await axios.post(`${API_ROUTE}/admin/payslip/generate/${employeeId}`, payload, config);
    const { status, message, data } = response.data ?? {};

    if (isSuccess(status) || response.status === 200) {
      dispatch({
        type: COMPANY_PAYSLIP_GENERATE_SUCCESS,
        payload: data || response.data.data || [],
      });
      return response.data;
    }

    dispatch({
      type: COMPANY_PAYSLIP_GENERATE_FAILURE,
      payload: message || commonError,
    });
  } catch (error) {
    dispatch({
      type: COMPANY_PAYSLIP_GENERATE_FAILURE,
      payload: error.response?.data?.message || error.message || commonError,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const CompanyReleivingLetter = (employeeId, payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: COMPANY_RELEIVING_LETTER_GENERATE_REQUEST });
  try {
    const config = payload instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const response = await axios.post(`${API_ROUTE}/admin/relieving-letter/generate/${employeeId}`, payload, config);
    const { status, message, data } = response.data ?? {};

    if (isSuccess(status) || response.status === 200) {
      dispatch({
        type: COMPANY_RELEIVING_LETTER_GENERATE_SUCCESS,
        payload: data || response.data.data || [],
      });
      return response.data;
    }

    dispatch({
      type: COMPANY_RELEIVING_LETTER_GENERATE_FAILURE,
      payload: message || commonError,
    });
  } catch (error) {
    dispatch({
      type: COMPANY_RELEIVING_LETTER_GENERATE_FAILURE,
      payload: error.response?.data?.message || error.message || commonError,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const CompanyRoles = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: COMPANY_GET_ROLES_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/admin/roles`);
    const { status, message, data } = response.data ?? {};

    if (isSuccess(status) || response.status === 200) {
      dispatch({
        type: COMPANY_GET_ROLES_SUCCESS,
        payload: data || response.data.data || [],
      });
      return response.data;
    }

    dispatch({
      type: COMPANY_GET_ROLES_FAILURE,
      payload: message || commonError,
    });
  } catch (error) {
    dispatch({
      type: COMPANY_GET_ROLES_FAILURE,
      payload: error.response?.data?.message || error.message || commonError,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const CompanyDepartments = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: COMPANY_GET_DEPARTMENTS_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/admin/departments`);
    const { status, message, data } = response.data ?? {};

    if (isSuccess(status) || response.status === 200) {
      dispatch({
        type: COMPANY_GET_DEPARTMENTS_SUCCESS,
        payload: data || response.data.data || [],
      });
      return response.data;
    }

    dispatch({
      type: COMPANY_GET_DEPARTMENTS_FAILURE,
      payload: message || commonError,
    });
  } catch (error) {
    dispatch({
      type: COMPANY_GET_DEPARTMENTS_FAILURE,
      payload: error.response?.data?.message || error.message || commonError,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};