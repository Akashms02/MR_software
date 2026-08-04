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
  UPDATE_DOCTOR_LOCATION_REQUEST,
  UPDATE_DOCTOR_LOCATION_SUCCESS,
  UPDATE_DOCTOR_LOCATION_FAILURE,
  UPDATE_ONBOARDING_REQUEST_REQUEST,
  UPDATE_ONBOARDING_REQUEST_SUCCESS,
  UPDATE_ONBOARDING_REQUEST_FAILURE,
  DELETE_ONBOARDING_REQUEST_REQUEST,
  DELETE_ONBOARDING_REQUEST_SUCCESS,
  DELETE_ONBOARDING_REQUEST_FAILURE,
} from "../actionType/requestActionType";

const initialState = {
  loading: false,
  error: null,
  success: null,
  requests: [],
  pagination: null,
};

export const requestReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PENDING_REQUESTS_REQUEST:
    case FETCH_ME_REQUESTS_REQUEST:
    case SUBMIT_ONBOARDING_REQUEST_REQUEST:
    case REVIEW_ONBOARDING_REQUEST_REQUEST:
    case UPDATE_DOCTOR_LOCATION_REQUEST:
    case UPDATE_ONBOARDING_REQUEST_REQUEST:
    case DELETE_ONBOARDING_REQUEST_REQUEST:
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
        pagination: action.pagination || null,
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
    case UPDATE_ONBOARDING_REQUEST_SUCCESS:
      return {
        ...state,
        loading: false,
        success: `Request updated successfully!`,
        requests: state.requests.map((r) =>
          r.id === action.payload.id ? action.payload : r
        ),
        error: null,
      };

    case DELETE_ONBOARDING_REQUEST_SUCCESS:
      return {
        ...state,
        loading: false,
        success: "Onboarding request deleted successfully!",
        requests: state.requests.filter((r) => r.id !== action.payload),
        error: null,
      };

    case UPDATE_DOCTOR_LOCATION_SUCCESS:
      return {
        ...state,
        loading: false,
        success: "Doctor location updated successfully!",
        requests: state.requests.map((r) =>
          (r.id === action.payload.doctorId || r.doctorId === action.payload.doctorId)
            ? { ...r, latitude: action.payload.latitude, longitude: action.payload.longitude }
            : r
        ),
        error: null,
      };

    case FETCH_PENDING_REQUESTS_FAILURE:
    case FETCH_ME_REQUESTS_FAILURE:
    case SUBMIT_ONBOARDING_REQUEST_FAILURE:
    case REVIEW_ONBOARDING_REQUEST_FAILURE:
    case UPDATE_DOCTOR_LOCATION_FAILURE:
    case UPDATE_ONBOARDING_REQUEST_FAILURE:
    case DELETE_ONBOARDING_REQUEST_FAILURE:
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
