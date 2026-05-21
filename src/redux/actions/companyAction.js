import axios from "../../api/axiosInstance";
import { API_ROUTE } from "../../data/env";
import { COMPANY_ACTIVE_DEATIVE_BUTTON_REQUEST_FAILURE, COMPANY_ACTIVE_DEATIVE_BUTTON_REQUEST_REQUEST, COMPANY_ACTIVE_DEATIVE_BUTTON_REQUEST_SUCCESS, COMPANY_EDIT_DATA_REQUEST_FAILURE, COMPANY_EDIT_DATA_REQUEST_REQUEST, COMPANY_EDIT_DATA_REQUEST_SUCCESS } from "../actionType/companyActionType";
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
    const response = await axios.put(`${API_ROUTE}/admin/company/${adminId}`, payload);
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