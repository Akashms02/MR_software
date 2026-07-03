import axios from "../../api/axiosInstance";
import { API_ROUTE } from "../../data/env";
import {
  FETCH_PAYSLIP_REQUEST,
  FETCH_PAYSLIP_SUCCESS,
  FETCH_PAYSLIP_FAILURE,
  FETCH_LATEST_PAYSLIP_REQUEST,
  FETCH_LATEST_PAYSLIP_SUCCESS,
  FETCH_LATEST_PAYSLIP_FAILURE,
  FETCH_RELIEVING_LETTER_REQUEST,
  FETCH_RELIEVING_LETTER_SUCCESS,
  FETCH_RELIEVING_LETTER_FAILURE,
  FETCH_TERMINATION_LETTER_REQUEST,
  FETCH_TERMINATION_LETTER_SUCCESS,
  FETCH_TERMINATION_LETTER_FAILURE,
  CLEAR_DOCUMENT_ERRORS
} from "../actionType/documentActionType";
import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";

const commonError = "Something went wrong!";

export const fetchPayslipAction = (monthName, year) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_PAYSLIP_REQUEST });
  try {
    const response = await axios.post(`${API_ROUTE}/payslips/my`, { month: monthName, year });
    const data = response.data?.data || response.data;
    if (data && (Array.isArray(data) ? data.length > 0 : data)) {
      const payslip = Array.isArray(data) ? data[0] : data;
      dispatch({ type: FETCH_PAYSLIP_SUCCESS, payload: payslip });
      return payslip;
    } else {
      throw new Error(`No payslip generated for ${monthName} ${year}`);
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_PAYSLIP_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const fetchLatestPayslipAction = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_LATEST_PAYSLIP_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/payslips/my/latest`);
    const data = response.data?.data || response.data;
    if (data) {
      dispatch({ type: FETCH_LATEST_PAYSLIP_SUCCESS, payload: data });
      return data;
    } else {
      throw new Error("No latest payslip found.");
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_LATEST_PAYSLIP_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const fetchRelievingLetterAction = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_RELIEVING_LETTER_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/letters/download?type=relieving`, {
      responseType: 'blob'
    });
    const data = response.data;
    dispatch({ type: FETCH_RELIEVING_LETTER_SUCCESS, payload: true });
    return data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_RELIEVING_LETTER_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const fetchTerminationLetterAction = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_TERMINATION_LETTER_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/letters/download?type=termination`, {
      responseType: 'blob'
    });
    const data = response.data;
    dispatch({ type: FETCH_TERMINATION_LETTER_SUCCESS, payload: true });
    return data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_TERMINATION_LETTER_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const clearDocumentErrorsAction = () => (dispatch) => {
  dispatch({ type: CLEAR_DOCUMENT_ERRORS });
};
