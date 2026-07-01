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
} from '../actionType/teamActionType';
import { LOADING_START, LOADING_END } from '../actionType/loadingActionType';

const initialState = {
  loading: false,
  error: null,
  success: null,
  message: null,
  team: [],
};

export const teamReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOADING_START:
    case TEAM_LIST_REQUEST:
    case TEAM_ONBOARD_REQUEST:
    case DOCTOR_EXCEL_UPLOAD_REQUEST:
    case CHEMIST_EXCEL_UPLOAD_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case LOADING_END:
      return {
        ...state,
        loading: false,
      };

    case TEAM_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        team: Array.isArray(action.payload) ? action.payload : [],
      };

    case TEAM_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        team: [],
      };

    case TEAM_ONBOARD_SUCCESS:
    case DOCTOR_EXCEL_UPLOAD_SUCCESS:
    case CHEMIST_EXCEL_UPLOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        success: true,
        message: action.payload?.message || 
          (action.type === DOCTOR_EXCEL_UPLOAD_SUCCESS || action.type === CHEMIST_EXCEL_UPLOAD_SUCCESS 
            ? 'Excel uploaded successfully' 
            : 'Member onboarded successfully'),
      };

    case TEAM_ONBOARD_FAILURE:
    case DOCTOR_EXCEL_UPLOAD_FAILURE:
    case CHEMIST_EXCEL_UPLOAD_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
      };

    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };

    case CLEAR_SUCCESS:
      return {
        ...state,
        success: null,
        message: null,
      };

    default:
      return state;
  }
};
