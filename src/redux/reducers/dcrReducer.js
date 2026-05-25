import {
  FETCH_MY_DCRS_REQUEST,
  FETCH_MY_DCRS_SUCCESS,
  FETCH_MY_DCRS_FAILURE,
  SAVE_DCR_DRAFT_REQUEST,
  SAVE_DCR_DRAFT_SUCCESS,
  SAVE_DCR_DRAFT_FAILURE,
  SUBMIT_DCR_REQUEST,
  SUBMIT_DCR_SUCCESS,
  SUBMIT_DCR_FAILURE,
  FETCH_DCR_DETAILS_REQUEST,
  FETCH_DCR_DETAILS_SUCCESS,
  FETCH_DCR_DETAILS_FAILURE,
  CLEAR_DCR_ERRORS,
  CLEAR_DCR_SUCCESS,
  FETCH_TEAM_DCRS_REQUEST,
  FETCH_TEAM_DCRS_SUCCESS,
  FETCH_TEAM_DCRS_FAILURE,
  REVIEW_DCR_REQUEST,
  REVIEW_DCR_SUCCESS,
  REVIEW_DCR_FAILURE,
} from "../actionType/dcrActionType";

const initialState = {
  loading: false,
  error: null,
  success: null,
  dcrs: [],
  teamDcrs: [],
  currentDcr: null,
};

export const dcrReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MY_DCRS_REQUEST:
    case SAVE_DCR_DRAFT_REQUEST:
    case SUBMIT_DCR_REQUEST:
    case FETCH_DCR_DETAILS_REQUEST:
    case FETCH_TEAM_DCRS_REQUEST:
    case REVIEW_DCR_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_MY_DCRS_SUCCESS:
      return {
        ...state,
        loading: false,
        dcrs: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };

    case FETCH_TEAM_DCRS_SUCCESS:
      return {
        ...state,
        loading: false,
        teamDcrs: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };

    case SAVE_DCR_DRAFT_SUCCESS:
      return {
        ...state,
        loading: false,
        success: "DCR Draft saved successfully!",
        dcrs: action.payload ? [...state.dcrs.filter(d => d.id !== action.payload.id), action.payload] : state.dcrs,
        error: null,
      };

    case SUBMIT_DCR_SUCCESS:
      return {
        ...state,
        loading: false,
        success: "DCR Submitted successfully!",
        dcrs: state.dcrs.map(d => d.id === action.payload ? { ...d, status: 'SUBMITTED' } : d),
        error: null,
      };

    case REVIEW_DCR_SUCCESS:
      return {
        ...state,
        loading: false,
        success: `DCR report successfully ${action.payload.status.toLowerCase()}!`,
        teamDcrs: state.teamDcrs.map(d => d.id === action.payload.dcrId ? { ...d, status: action.payload.status, remarks: action.payload.remarks } : d),
        error: null,
      };

    case FETCH_DCR_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        currentDcr: action.payload,
        error: null,
      };

    case FETCH_MY_DCRS_FAILURE:
    case SAVE_DCR_DRAFT_FAILURE:
    case SUBMIT_DCR_FAILURE:
    case FETCH_DCR_DETAILS_FAILURE:
    case FETCH_TEAM_DCRS_FAILURE:
    case REVIEW_DCR_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case CLEAR_DCR_ERRORS:
      return {
        ...state,
        error: null,
      };

    case CLEAR_DCR_SUCCESS:
      return {
        ...state,
        success: null,
      };

    default:
      return state;
  }
};
