import {
  PUNCH_IN_REQUEST,
  PUNCH_IN_SUCCESS,
  PUNCH_IN_FAILURE,
  PUNCH_OUT_REQUEST,
  PUNCH_OUT_SUCCESS,
  PUNCH_OUT_FAILURE,
  FETCH_MY_ATTENDANCE_REQUEST,
  FETCH_MY_ATTENDANCE_SUCCESS,
  FETCH_MY_ATTENDANCE_FAILURE,
  FETCH_TEAM_ATTENDANCE_REQUEST,
  FETCH_TEAM_ATTENDANCE_SUCCESS,
  FETCH_TEAM_ATTENDANCE_FAILURE,
  LOCATION_CHECK_IN_REQUEST,
  LOCATION_CHECK_IN_SUCCESS,
  LOCATION_CHECK_IN_FAILURE,
  LOCATION_CHECK_OUT_REQUEST,
  LOCATION_CHECK_OUT_SUCCESS,
  LOCATION_CHECK_OUT_FAILURE,
  FETCH_MY_VISITS_REQUEST,
  FETCH_MY_VISITS_SUCCESS,
  FETCH_MY_VISITS_FAILURE,
  FETCH_TEAM_VISITS_REQUEST,
  FETCH_TEAM_VISITS_SUCCESS,
  FETCH_TEAM_VISITS_FAILURE,
} from "../actionType/attendanceActionType";
import { isPunchActive, isSameCalendarDay, isVisitActive } from "../../utils/attendanceUtils";

const initialState = {
  loading: false,
  error: null,
  success: null,
  myAttendance: [],
  myVisits: [],
  teamAttendance: [],
  teamVisits: [],
};

export const attendanceReducer = (state = initialState, action) => {
  switch (action.type) {
    case PUNCH_IN_REQUEST:
    case PUNCH_OUT_REQUEST:
    case FETCH_MY_ATTENDANCE_REQUEST:
    case FETCH_TEAM_ATTENDANCE_REQUEST:
    case LOCATION_CHECK_IN_REQUEST:
    case LOCATION_CHECK_OUT_REQUEST:
    case FETCH_MY_VISITS_REQUEST:
    case FETCH_TEAM_VISITS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case PUNCH_IN_SUCCESS: {
      const record = action.payload;
      if (!record) {
        return { ...state, loading: false, success: "Punched in successfully!", error: null };
      }
      const rest = state.myAttendance.filter(
        (a) =>
          !(
            a?.punchInTime &&
            record.punchInTime &&
            isSameCalendarDay(a.punchInTime, record.punchInTime) &&
            isPunchActive(a)
          )
      );
      return {
        ...state,
        loading: false,
        success: "Punched in successfully!",
        myAttendance: [record, ...rest],
        error: null,
      };
    }

    case PUNCH_OUT_SUCCESS:
      return {
        ...state,
        loading: false,
        success: "Punched out successfully!",
        myAttendance: action.payload
          ? state.myAttendance.map((a) => (a.id === action.payload.id ? action.payload : a))
          : state.myAttendance,
        error: null,
      };

    case FETCH_MY_ATTENDANCE_SUCCESS:
      return {
        ...state,
        loading: false,
        myAttendance: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };

    case FETCH_TEAM_ATTENDANCE_SUCCESS:
      return {
        ...state,
        loading: false,
        teamAttendance: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };

    case LOCATION_CHECK_IN_SUCCESS: {
      const record = action.payload;
      if (!record) {
        return { ...state, loading: false, success: "Checked in to location successfully!", error: null };
      }
      const rest = state.myVisits.filter((v) => !isVisitActive(v));
      return {
        ...state,
        loading: false,
        success: "Checked in to location successfully!",
        myVisits: [{ ...record, status: record.status || 'CHECKED_IN' }, ...rest],
        error: null,
      };
    }

    case LOCATION_CHECK_OUT_SUCCESS:
      return {
        ...state,
        loading: false,
        success: "Checked out of location successfully!",
        myVisits: action.payload
          ? state.myVisits.map((v) => (v.id === action.payload.id ? action.payload : v))
          : state.myVisits,
        error: null,
      };

    case FETCH_MY_VISITS_SUCCESS:
      return {
        ...state,
        loading: false,
        myVisits: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };

    case FETCH_TEAM_VISITS_SUCCESS:
      return {
        ...state,
        loading: false,
        teamVisits: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };

    case PUNCH_IN_FAILURE:
    case PUNCH_OUT_FAILURE:
    case FETCH_MY_ATTENDANCE_FAILURE:
    case FETCH_TEAM_ATTENDANCE_FAILURE:
    case LOCATION_CHECK_IN_FAILURE:
    case LOCATION_CHECK_OUT_FAILURE:
    case FETCH_MY_VISITS_FAILURE:
    case FETCH_TEAM_VISITS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};
