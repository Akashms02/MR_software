import {
  ADMIN_LIST_REQUEST,
  ADMIN_LIST_SUCCESS,
  ADMIN_LIST_FAILURE,
  ADMIN_REGISTER_REQUEST,
  ADMIN_REGISTER_SUCCESS,
  ADMIN_REGISTER_FAILURE,
  ADMIN_UPDATE_REQUEST,
  ADMIN_UPDATE_SUCCESS,
  ADMIN_UPDATE_FAILURE,
  CLEAR_ERRORS,
  CLEAR_SUCCESS
} from '../actionType/adminActionType';
import { LOADING_START, LOADING_END } from '../actionType/loadingActionType';

const initialState = {
  loading: false,
  error: null,
  success: null,
  message: null,
  admins: [],
};

export const adminReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOADING_START:
    case ADMIN_LIST_REQUEST:
    case ADMIN_REGISTER_REQUEST:
    case ADMIN_UPDATE_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case LOADING_END:
      return {
        ...state,
        loading: false,
      };

    case ADMIN_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        admins: action.payload || [],
      };

    case ADMIN_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        admins: [],
      };

    case ADMIN_REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        success: true,
        message: action.payload?.message || 'Admin registered successfully',
      };

    case ADMIN_REGISTER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
      };

    case ADMIN_UPDATE_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        success: true,
        message: action.payload?.message || 'Admin updated successfully',
      };

    case ADMIN_UPDATE_FAILURE:
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
