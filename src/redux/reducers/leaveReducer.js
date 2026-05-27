import {
  FETCH_MY_LEAVES_REQUEST,
  FETCH_MY_LEAVES_SUCCESS,
  FETCH_MY_LEAVES_FAILURE,
  APPLY_LEAVE_REQUEST,
  APPLY_LEAVE_SUCCESS,
  APPLY_LEAVE_FAILURE,
  FETCH_TEAM_LEAVES_REQUEST,
  FETCH_TEAM_LEAVES_SUCCESS,
  FETCH_TEAM_LEAVES_FAILURE,
  REVIEW_LEAVE_REQUEST,
  REVIEW_LEAVE_SUCCESS,
  REVIEW_LEAVE_FAILURE,
  CLEAR_LEAVE_ERRORS,
  CLEAR_LEAVE_SUCCESS,
} from "../actionType/leaveActionType";

const initialState = {
  loading: false,
  error: null,
  success: null,
  leaves: [],
  teamLeaves: [],
};

export const leaveReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MY_LEAVES_REQUEST:
    case APPLY_LEAVE_REQUEST:
    case FETCH_TEAM_LEAVES_REQUEST:
    case REVIEW_LEAVE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_MY_LEAVES_SUCCESS:
      return {
        ...state,
        loading: false,
        leaves: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };

    case FETCH_TEAM_LEAVES_SUCCESS:
      return {
        ...state,
        loading: false,
        teamLeaves: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };

    case APPLY_LEAVE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: "Leave request submitted successfully!",
        leaves: action.payload ? [action.payload, ...state.leaves] : state.leaves,
        error: null,
      };

    case REVIEW_LEAVE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: `Leave request successfully ${action.payload.status.toLowerCase()}!`,
        teamLeaves: state.teamLeaves.map((l) =>
          l.id === action.payload.leaveId
            ? { ...l, status: action.payload.status, remarks: action.payload.remarks, managerRemarks: action.payload.remarks }
            : l
        ),
        error: null,
      };

    case FETCH_MY_LEAVES_FAILURE:
    case APPLY_LEAVE_FAILURE:
    case FETCH_TEAM_LEAVES_FAILURE:
    case REVIEW_LEAVE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case CLEAR_LEAVE_ERRORS:
      return {
        ...state,
        error: null,
      };

    case CLEAR_LEAVE_SUCCESS:
      return {
        ...state,
        success: null,
      };

    default:
      return state;
  }
};
