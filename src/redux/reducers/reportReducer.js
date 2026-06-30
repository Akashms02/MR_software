import {
  GET_VISIT_SUMMARY_REQUEST,
  GET_VISIT_SUMMARY_SUCCESS,
  GET_VISIT_SUMMARY_FAILURE,
  GET_DATEWISE_DAILY_REQUEST,
  GET_DATEWISE_DAILY_SUCCESS,
  GET_DATEWISE_DAILY_FAILURE,
  GET_CALL_VISIT_REQUEST,
  GET_CALL_VISIT_SUCCESS,
  GET_CALL_VISIT_FAILURE,
  GET_DCR_DAY_REQUEST,
  GET_DCR_DAY_SUCCESS,
  GET_DCR_DAY_FAILURE,
  GET_DAILY_ACTIVITY_REQUEST,
  GET_DAILY_ACTIVITY_SUCCESS,
  GET_DAILY_ACTIVITY_FAILURE,
  GET_WEEKLY_CROSS_REQUEST,
  GET_WEEKLY_CROSS_SUCCESS,
  GET_WEEKLY_CROSS_FAILURE,
  CLEAR_REPORT_ERRORS,
  DISTRIBUTES_REPORT_REQUEST,
  DISTRIBUTES_REPORT_FAILURE,
  DISTRIBUTES_REPORT_SUCCESS,
  GET_DISTRIBUTORS_REQUEST,
  GET_DISTRIBUTORS_SUCCESS,
  GET_DISTRIBUTORS_FAILURE,
} from "../actionType/reportActionType";

const initialState = {
  loading: false,
  error: null,
  visitSummary: null,
  datewiseDaily: null,
  callVisit: null,
  dcrDay: null,
  dailyActivity: null,
  weeklyCross: null,
  distributesReport: null,
  distributorsList: [],
};

export const reportReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_VISIT_SUMMARY_REQUEST:
    case GET_DATEWISE_DAILY_REQUEST:
    case GET_CALL_VISIT_REQUEST:
    case GET_DCR_DAY_REQUEST:
    case GET_DAILY_ACTIVITY_REQUEST:
    case GET_WEEKLY_CROSS_REQUEST:
    case DISTRIBUTES_REPORT_REQUEST:
    case GET_DISTRIBUTORS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_VISIT_SUMMARY_SUCCESS:
      console.log("[reportReducer] GET_VISIT_SUMMARY_SUCCESS payload:", action.payload);
      return {
        ...state,
        loading: false,
        visitSummary: action.payload,
        error: null,
      };

    case GET_DATEWISE_DAILY_SUCCESS:
      console.log("[reportReducer] GET_DATEWISE_DAILY_SUCCESS payload:", action.payload);
      return {
        ...state,
        loading: false,
        datewiseDaily: action.payload,
        error: null,
      };

    case GET_CALL_VISIT_SUCCESS:
      return {
        ...state,
        loading: false,
        callVisit: action.payload,
        error: null,
      };

    case GET_DCR_DAY_SUCCESS:
      return {
        ...state,
        loading: false,
        dcrDay: action.payload,
        error: null,
      };
    case DISTRIBUTES_REPORT_SUCCESS:
      return {
        ...state,
        loading: false,
        distributesReport: action.payload,
        error: null,
      };
    case GET_DISTRIBUTORS_SUCCESS:
      return {
        ...state,
        loading: false,
        distributorsList: action.payload,
        error: null,
      };
    case GET_DAILY_ACTIVITY_SUCCESS:
      return {
        ...state,
        loading: false,
        dailyActivity: action.payload,
        error: null,
      };

    case GET_WEEKLY_CROSS_SUCCESS:
      return {
        ...state,
        loading: false,
        weeklyCross: action.payload,
        error: null,
      };

    case GET_VISIT_SUMMARY_FAILURE:
    case GET_DATEWISE_DAILY_FAILURE:
    case GET_CALL_VISIT_FAILURE:
    case GET_DCR_DAY_FAILURE:
    case GET_DAILY_ACTIVITY_FAILURE:
    case GET_WEEKLY_CROSS_FAILURE:
    case DISTRIBUTES_REPORT_FAILURE:
    case GET_DISTRIBUTORS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case CLEAR_REPORT_ERRORS:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};
