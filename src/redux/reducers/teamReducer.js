import {
  TEAM_LIST_REQUEST,
  TEAM_LIST_SUCCESS,
  TEAM_LIST_FAILURE,
  TEAM_ONBOARD_REQUEST,
  TEAM_ONBOARD_SUCCESS,
  TEAM_ONBOARD_FAILURE,
  CLEAR_ERRORS,
  CLEAR_SUCCESS
} from '../actionType/teamActionType';
import { LOADING_START, LOADING_END } from '../actionType/loadingActionType';

const initialState = {
  loading: false,
  error: null,
  success: null,
  message: null,
  team: [],
};

export const teamReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOADING_START:
    case TEAM_LIST_REQUEST:
    case TEAM_ONBOARD_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case LOADING_END:
      return {
        ...state,
        loading: false,
      };

    case TEAM_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        team: action.payload || [],
      };

    case TEAM_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        team: [],
      };

    case TEAM_ONBOARD_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        success: true,
        message: action.payload?.message || 'Member onboarded successfully',
      };

    case TEAM_ONBOARD_FAILURE:
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
