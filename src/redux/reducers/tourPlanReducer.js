import {
  FETCH_MY_TOUR_PLANS_REQUEST,
  FETCH_MY_TOUR_PLANS_SUCCESS,
  FETCH_MY_TOUR_PLANS_FAILURE,
  SAVE_TOUR_PLAN_DRAFT_REQUEST,
  SAVE_TOUR_PLAN_DRAFT_SUCCESS,
  SAVE_TOUR_PLAN_DRAFT_FAILURE,
  SUBMIT_TOUR_PLAN_REQUEST,
  SUBMIT_TOUR_PLAN_SUCCESS,
  SUBMIT_TOUR_PLAN_FAILURE,
  FETCH_TOUR_PLAN_DETAILS_REQUEST,
  FETCH_TOUR_PLAN_DETAILS_SUCCESS,
  FETCH_TOUR_PLAN_DETAILS_FAILURE,
  FETCH_TEAM_TOUR_PLANS_REQUEST,
  FETCH_TEAM_TOUR_PLANS_SUCCESS,
  FETCH_TEAM_TOUR_PLANS_FAILURE,
  REVIEW_TOUR_PLAN_REQUEST,
  REVIEW_TOUR_PLAN_SUCCESS,
  REVIEW_TOUR_PLAN_FAILURE,
  CLEAR_TOUR_PLAN_ERRORS,
  CLEAR_TOUR_PLAN_SUCCESS,
} from "../actionType/tourPlanActionType";

const initialState = {
  loading: false,
  error: null,
  success: null,
  tourPlans: [],
  teamTourPlans: [],
  currentTourPlan: null,
};

export const tourPlanReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MY_TOUR_PLANS_REQUEST:
    case SAVE_TOUR_PLAN_DRAFT_REQUEST:
    case SUBMIT_TOUR_PLAN_REQUEST:
    case FETCH_TOUR_PLAN_DETAILS_REQUEST:
    case FETCH_TEAM_TOUR_PLANS_REQUEST:
    case REVIEW_TOUR_PLAN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_MY_TOUR_PLANS_SUCCESS:
      return {
        ...state,
        loading: false,
        tourPlans: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };

    case FETCH_TEAM_TOUR_PLANS_SUCCESS:
      return {
        ...state,
        loading: false,
        teamTourPlans: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };

    case SAVE_TOUR_PLAN_DRAFT_SUCCESS:
      return {
        ...state,
        loading: false,
        success: "Tour Plan Draft saved successfully!",
        tourPlans: action.payload ? [...state.tourPlans.filter(p => p.id !== action.payload.id), action.payload] : state.tourPlans,
        error: null,
      };

    case SUBMIT_TOUR_PLAN_SUCCESS:
      return {
        ...state,
        loading: false,
        success: "Tour Plan submitted successfully!",
        tourPlans: state.tourPlans.map(p => p.id === action.payload ? { ...p, status: 'SUBMITTED' } : p),
        error: null,
      };

    case REVIEW_TOUR_PLAN_SUCCESS:
      return {
        ...state,
        loading: false,
        success: `Tour Plan successfully ${action.payload.status.toLowerCase()}!`,
        teamTourPlans: state.teamTourPlans.map(p => p.id === action.payload.planId ? { ...p, status: action.payload.status, remarks: action.payload.remarks } : p),
        error: null,
      };

    case FETCH_TOUR_PLAN_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        currentTourPlan: action.payload,
        error: null,
      };

    case FETCH_MY_TOUR_PLANS_FAILURE:
    case SAVE_TOUR_PLAN_DRAFT_FAILURE:
    case SUBMIT_TOUR_PLAN_FAILURE:
    case FETCH_TOUR_PLAN_DETAILS_FAILURE:
    case FETCH_TEAM_TOUR_PLANS_FAILURE:
    case REVIEW_TOUR_PLAN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case CLEAR_TOUR_PLAN_ERRORS:
      return {
        ...state,
        error: null,
      };

    case CLEAR_TOUR_PLAN_SUCCESS:
      return {
        ...state,
        success: null,
      };

    default:
      return state;
  }
};
