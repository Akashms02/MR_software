import {
  FETCH_PENDING_REQUESTS_REQUEST,
  FETCH_PENDING_REQUESTS_SUCCESS,
  FETCH_PENDING_REQUESTS_FAILURE,
  FETCH_ME_REQUESTS_REQUEST,
  FETCH_ME_REQUESTS_SUCCESS,
  FETCH_ME_REQUESTS_FAILURE,
  SUBMIT_ONBOARDING_REQUEST_REQUEST,
  SUBMIT_ONBOARDING_REQUEST_SUCCESS,
  SUBMIT_ONBOARDING_REQUEST_FAILURE,
  REVIEW_ONBOARDING_REQUEST_REQUEST,
  REVIEW_ONBOARDING_REQUEST_SUCCESS,
  REVIEW_ONBOARDING_REQUEST_FAILURE,
} from "../actionType/requestActionType";

const initialState = {
  loading: false,
  error: null,
  success: null,
  requests: [],
};

export const requestReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PENDING_REQUESTS_REQUEST:
    case FETCH_ME_REQUESTS_REQUEST:
    case SUBMIT_ONBOARDING_REQUEST_REQUEST:
    case REVIEW_ONBOARDING_REQUEST_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        success: null,
      };

    case FETCH_PENDING_REQUESTS_SUCCESS:
    case FETCH_ME_REQUESTS_SUCCESS:
      return {
        ...state,
        loading: false,
        requests: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };

    case SUBMIT_ONBOARDING_REQUEST_SUCCESS:
      return {
        ...state,
        loading: false,
        success: "Onboarding request submitted successfully!",
        requests: [action.payload, ...state.requests],
        error: null,
      };

    case REVIEW_ONBOARDING_REQUEST_SUCCESS:
      return {
        ...state,
        loading: false,
        success: `Request reviewed successfully!`,
        requests: state.requests.map((r) =>
          r.id === action.payload.id ? action.payload : r
        ),
        error: null,
      };

    case FETCH_PENDING_REQUESTS_FAILURE:
    case FETCH_ME_REQUESTS_FAILURE:
    case SUBMIT_ONBOARDING_REQUEST_FAILURE:
    case REVIEW_ONBOARDING_REQUEST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: null,
      };

    default:
      return state;
  }
};
