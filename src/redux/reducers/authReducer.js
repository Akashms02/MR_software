import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  FETCH_PROFILE_REQUEST,
  FETCH_PROFILE_SUCCESS,
  FETCH_PROFILE_FAILURE,
  LOGOUT,
  CLEAR_ERRORS,
  SET_REQUIRE_PASSWORD_CHANGE,
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_FAILURE,
  VERIFY_OTP_REQUEST,
  VERIFY_OTP_SUCCESS,
  VERIFY_OTP_FAILURE,
  CHANGE_PASSWORD_REQUEST,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FAILURE,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAILURE,
  INITIALIZE_AUTH_START,
  INITIALIZE_AUTH_COMPLETE,
  UPDATE_PROFILE_REQUEST,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAILURE,
  UPDATE_PROFILE_ADMIN_SUCCESS
} from '../actionType/authActionType';

// Hydrate initial state from localStorage with Expiration Check
const getInitialAuthState = () => {
  try {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('accessToken');
    const expiryTime = localStorage.getItem('expiryTime');

    // If session is clearly expired AND no refresh token, wipe it now for a clean login page
    if (expiryTime && Date.now() > Number(expiryTime)) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('expiryTime');
        return { user: null, token: null, isAuthenticated: false };
      }
    }

    return {
      user: savedUser ? JSON.parse(savedUser) : null,
      token: savedToken || null,
      isAuthenticated: false // Will be set to true by initializeAuth on success
    };
  } catch (error) {
    console.error("Initial Auth hydration failed:", error);
    return {
      user: null,
      token: null,
      isAuthenticated: false
    };
  }
};

const initialState = {
  loading: false,
  error: null,
  success: false,
  resetPasswordSuccess: false,
  message: null,

  // Persistent Auth State with Expiry Logic
  ...getInitialAuthState(),

  // Onboarding/Password Reset Flow
  mobileNo: null,
  otp: null,
  requiresPasswordChange: false,

  // Global App Initialization State
  isInitializing: true,
};

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
    case FETCH_PROFILE_REQUEST:
    case UPDATE_PROFILE_REQUEST:
    case FORGOT_PASSWORD_REQUEST:
    case VERIFY_OTP_REQUEST:
    case RESET_PASSWORD_REQUEST:
    case CHANGE_PASSWORD_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: { ...state.user, ...action.payload.user },
        token: action.payload.token || state.token,
        error: null,
      };

    case FETCH_PROFILE_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: { ...state.user, ...action.payload },
        error: null,
      };

    case FORGOT_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        message: action.payload.message,
        mobileNo: action.payload.mobileNo,
        error: null,
      };

    case VERIFY_OTP_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        otp: action.payload.otp,
        mobileNo: action.payload.mobileNo,
        error: null,
      };

    case RESET_PASSWORD_SUCCESS:
    case CHANGE_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        resetPasswordSuccess: true,
        message: action.payload,
        error: null,
      };

    case UPDATE_PROFILE_SUCCESS:
    case UPDATE_PROFILE_ADMIN_SUCCESS:
      return {
        ...state,
        loading: false,
        user: { ...state.user, ...action.payload },
        error: null,
      };

    case LOGIN_FAILURE:
    case FORGOT_PASSWORD_FAILURE:
    case VERIFY_OTP_FAILURE:
    case RESET_PASSWORD_FAILURE:
    case CHANGE_PASSWORD_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case FETCH_PROFILE_FAILURE:
    case UPDATE_PROFILE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case LOGOUT:
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        success: false,
        resetPasswordSuccess: false,
        message: null,
        mobileNo: null,
        otp: null,
        requiresPasswordChange: false,
        isInitializing: false,
      };

    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
        success: false,
        resetPasswordSuccess: false,
        message: null,
      };

    case SET_REQUIRE_PASSWORD_CHANGE:
      return {
        ...state,
        requiresPasswordChange: action.payload,
      };

    case INITIALIZE_AUTH_START:
      return {
        ...state,
        isInitializing: true,
      };

    case INITIALIZE_AUTH_COMPLETE:
      return {
        ...state,
        isInitializing: false,
      };

    default:
      return state;
  }
};
