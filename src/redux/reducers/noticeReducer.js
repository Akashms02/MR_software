import * as types from "../actionType/noticeActionType";

const initialState = {
  loading: false,
  error: null,
  success: null,
  adminNotices: [],
  activeNotices: [],
};

export const noticeReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.GET_NOTICES_REQUEST:
    case types.GET_ACTIVE_NOTICES_REQUEST:
    case types.CREATE_NOTICE_REQUEST:
    case types.UPDATE_NOTICE_REQUEST:
    case types.TOGGLE_ACTIVE_NOTICE_REQUEST:
    case types.DELETE_NOTICE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case types.GET_NOTICES_SUCCESS:
      return {
        ...state,
        loading: false,
        adminNotices: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };

    case types.GET_ACTIVE_NOTICES_SUCCESS:
      return {
        ...state,
        loading: false,
        activeNotices: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };

    case types.CREATE_NOTICE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: "Notice posted successfully!",
        adminNotices: [action.payload, ...state.adminNotices],
        error: null,
      };

    case types.UPDATE_NOTICE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: "Notice updated successfully!",
        adminNotices: state.adminNotices.map((n) =>
          n.id === action.payload.id ? action.payload : n
        ),
        error: null,
      };

    case types.TOGGLE_ACTIVE_NOTICE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: "Notice status updated successfully!",
        adminNotices: state.adminNotices.map((n) =>
          n.id === action.payload.id ? action.payload : n
        ),
        error: null,
      };

    case types.DELETE_NOTICE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: "Notice deleted successfully!",
        adminNotices: state.adminNotices.filter((n) => n.id !== action.payload),
        error: null,
      };

    case types.GET_NOTICES_FAILURE:
    case types.GET_ACTIVE_NOTICES_FAILURE:
    case types.CREATE_NOTICE_FAILURE:
    case types.UPDATE_NOTICE_FAILURE:
    case types.TOGGLE_ACTIVE_NOTICE_FAILURE:
    case types.DELETE_NOTICE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case types.CLEAR_NOTICE_ERRORS:
      return {
        ...state,
        error: null,
      };

    case types.CLEAR_NOTICE_SUCCESS:
      return {
        ...state,
        success: null,
      };

    // Keep hrms standard compatibility
    case 'CLEAR_NOTICE_SUCCESS':
      return {
        ...state,
        success: null,
      };

    default:
      return state;
  }
};
