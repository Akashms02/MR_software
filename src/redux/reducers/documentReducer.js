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

const initialState = {
  loading: false,
  error: null,
  success: false,
  payslipData: null,
  relievingLetterData: null,
  terminationLetterData: null,
};

export const documentReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PAYSLIP_REQUEST:
    case FETCH_LATEST_PAYSLIP_REQUEST:
    case FETCH_RELIEVING_LETTER_REQUEST:
    case FETCH_TERMINATION_LETTER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        success: false,
      };

    case FETCH_PAYSLIP_SUCCESS:
    case FETCH_LATEST_PAYSLIP_SUCCESS:
      return {
        ...state,
        loading: false,
        payslipData: action.payload,
        error: null,
        success: true,
      };

    case FETCH_RELIEVING_LETTER_SUCCESS:
      return {
        ...state,
        loading: false,
        relievingLetterData: true,
        error: null,
        success: true,
      };

    case FETCH_TERMINATION_LETTER_SUCCESS:
      return {
        ...state,
        loading: false,
        terminationLetterData: true,
        error: null,
        success: true,
      };

    case FETCH_PAYSLIP_FAILURE:
    case FETCH_LATEST_PAYSLIP_FAILURE:
    case FETCH_RELIEVING_LETTER_FAILURE:
    case FETCH_TERMINATION_LETTER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
      };

    case CLEAR_DOCUMENT_ERRORS:
      return {
        ...state,
        error: null,
        success: false,
      };

    default:
      return state;
  }
};
