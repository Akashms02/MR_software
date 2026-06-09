import {
  FETCH_HOLIDAYS_REQUEST,
  FETCH_HOLIDAYS_SUCCESS,
  FETCH_HOLIDAYS_FAILURE,
  FETCH_UPCOMING_HOLIDAYS_REQUEST,
  FETCH_UPCOMING_HOLIDAYS_SUCCESS,
  FETCH_UPCOMING_HOLIDAYS_FAILURE,
  FETCH_ACTIVE_UPCOMING_HOLIDAYS_REQUEST,
  FETCH_ACTIVE_UPCOMING_HOLIDAYS_SUCCESS,
  FETCH_ACTIVE_UPCOMING_HOLIDAYS_FAILURE,
  SYNC_HOLIDAYS_REQUEST,
  SYNC_HOLIDAYS_SUCCESS,
  SYNC_HOLIDAYS_FAILURE,
  CREATE_HOLIDAY_REQUEST,
  CREATE_HOLIDAY_SUCCESS,
  CREATE_HOLIDAY_FAILURE,
  UPDATE_HOLIDAY_REQUEST,
  UPDATE_HOLIDAY_SUCCESS,
  UPDATE_HOLIDAY_FAILURE,
  DELETE_HOLIDAY_REQUEST,
  DELETE_HOLIDAY_SUCCESS,
  DELETE_HOLIDAY_FAILURE,
  TOGGLE_HOLIDAY_VISIBILITY_REQUEST,
  TOGGLE_HOLIDAY_VISIBILITY_SUCCESS,
  TOGGLE_HOLIDAY_VISIBILITY_FAILURE,
  CLEAR_HOLIDAY_ERRORS,
  CLEAR_HOLIDAY_SUCCESS,
} from "../actionType/holidayActionType";

const initialState = {
  loading: false,
  error: null,
  success: null,
  holidays: [],
  upcomingHolidays: [],
  activeUpcomingHolidays: [],
};

export const holidayReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_HOLIDAYS_REQUEST:
    case FETCH_UPCOMING_HOLIDAYS_REQUEST:
    case FETCH_ACTIVE_UPCOMING_HOLIDAYS_REQUEST:
    case SYNC_HOLIDAYS_REQUEST:
    case CREATE_HOLIDAY_REQUEST:
    case UPDATE_HOLIDAY_REQUEST:
    case DELETE_HOLIDAY_REQUEST:
    case TOGGLE_HOLIDAY_VISIBILITY_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_HOLIDAYS_SUCCESS:
      return {
        ...state,
        loading: false,
        holidays: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };

    case FETCH_UPCOMING_HOLIDAYS_SUCCESS:
      return {
        ...state,
        loading: false,
        upcomingHolidays: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };

    case FETCH_ACTIVE_UPCOMING_HOLIDAYS_SUCCESS:
      return {
        ...state,
        loading: false,
        activeUpcomingHolidays: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };

    case SYNC_HOLIDAYS_SUCCESS:
      return {
        ...state,
        loading: false,
        success: action.payload,
        error: null,
      };

    case CREATE_HOLIDAY_SUCCESS:
      return {
        ...state,
        loading: false,
        success: "Holiday created successfully!",
        holidays: [action.payload, ...state.holidays],
        error: null,
      };

    case UPDATE_HOLIDAY_SUCCESS:
      return {
        ...state,
        loading: false,
        success: "Holiday updated successfully!",
        holidays: state.holidays.map((h) =>
          h.id === action.payload.id ? { ...h, ...action.payload.data } : h
        ),
        error: null,
      };

    case DELETE_HOLIDAY_SUCCESS:
      return {
        ...state,
        loading: false,
        success: "Holiday deleted successfully!",
        holidays: state.holidays.filter((h) => h.id !== action.payload),
        error: null,
      };

    case TOGGLE_HOLIDAY_VISIBILITY_SUCCESS:
      return {
        ...state,
        loading: false,
        success: "Holiday visibility updated successfully!",
        holidays: state.holidays.map((h) =>
          h.id === action.payload.id ? { ...h, ...action.payload.data } : h
        ),
        error: null,
      };

    case FETCH_HOLIDAYS_FAILURE:
    case FETCH_UPCOMING_HOLIDAYS_FAILURE:
    case FETCH_ACTIVE_UPCOMING_HOLIDAYS_FAILURE:
    case SYNC_HOLIDAYS_FAILURE:
    case CREATE_HOLIDAY_FAILURE:
    case UPDATE_HOLIDAY_FAILURE:
    case DELETE_HOLIDAY_FAILURE:
    case TOGGLE_HOLIDAY_VISIBILITY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case CLEAR_HOLIDAY_ERRORS:
      return {
        ...state,
        error: null,
      };

    case CLEAR_HOLIDAY_SUCCESS:
      return {
        ...state,
        success: null,
      };

    default:
      return state;
  }
};
