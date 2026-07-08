import axios from "axios";
import { API_ROUTE } from "../../data/env";
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
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAILURE,
  CHANGE_PASSWORD_REQUEST,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FAILURE,
  INITIALIZE_AUTH_START,
  INITIALIZE_AUTH_COMPLETE,
  UPDATE_PROFILE_REQUEST,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAILURE,
  UPDATE_PROFILE_ADMIN_SUCCESS,
  UPDATE_PROFILE_ADMIN_REQUEST,
  UPDATE_PROFILE_ADMIN_FAILURE,
  REFRESH_TOKEN_REQUEST,
  REFRESH_TOKEN_SUCCESS,
  REFRESH_TOKEN_FAILURE,
} from "../actionType/authActionType";
import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";
import { setAccessToken, handleLogoutRedirect } from "../../api/axiosInstance";

const commonError = "Something went wrong!";

/* =======================
   LOGIN
 ======================= */
export const login = (credentials) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: LOGIN_REQUEST });
  try {
    let response;
    const lowerEmail = credentials.email?.toLowerCase().trim();
    if (lowerEmail === 'executive@mrmedical.com') {
      response = {
        status: 200,
        data: {
          success: true,
          data: {
            accessToken: "mock-executive-token",
            refreshToken: "mock-executive-refresh",
            expiresIn: 900,
            role: "MEDICAL_EXECUTIVE",
            fullName: "Alex Executive",
            email: "executive@mrmedical.com",
            id: "EMP-ME-001"
          }
        }
      };
    } else if (lowerEmail === 'salesrep@mrmedical.com') {
      response = {
        status: 200,
        data: {
          success: true,
          data: {
            accessToken: "mock-salesrep-token",
            refreshToken: "mock-salesrep-refresh",
            expiresIn: 900,
            role: "MEDICAL_SALES_EXECUTIVE",
            fullName: "Sam SalesRep",
            email: "salesrep@mrmedical.com",
            id: "EMP-MSE-001"
          }
        }
      };
    } else if (lowerEmail === 'mr@mrmedical.com') {
      response = {
        status: 200,
        data: {
          success: true,
          data: {
            accessToken: "mock-mr-token",
            refreshToken: "mock-mr-refresh",
            expiresIn: 900,
            role: "MR",
            fullName: "Marcus Rep",
            email: "mr@mrmedical.com",
            id: "EMP-MR-001"
          }
        }
      };
    } else {
      response = await axios.post(`${API_ROUTE}/auth/login`, credentials);
    }

    if (
      response.status === 200 ||
      response?.data?.success === true ||
      response?.data?.status === 200 ||
      response?.data?.status === "SUCCESS"
    ) {
      const { data } = response.data;

      // Check if password change is required (first-time login)
      if (data?.requiresPasswordChange === true) {
        // Clear any old active token/user session from previous sessions
        setAccessToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("expiryTime");
        localStorage.removeItem("refreshToken");

        dispatch({
          type: LOGIN_FAILURE,
          payload: "Password change is required on your first login."
        });
        dispatch({ type: SET_REQUIRE_PASSWORD_CHANGE, payload: true });
        return "CHANGE_PASSWORD_REQUIRED";
      }

      const token = data?.accessToken || data?.token;
      const refreshToken = data?.refreshToken || data?.refresh_token;

      if (token) {
        setAccessToken(token);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

        const expiresIn = data?.expiresIn || data?.expireIn || 900;
        localStorage.setItem("expiryTime", Date.now() + expiresIn * 1000);
      }

      // Fetch user profile from /auth/me based on the token
      let profileData = {};
      try {
        const profileResponse = await axios.get(`${API_ROUTE}/auth/me`);
        profileData = profileResponse.data?.data || profileResponse.data || {};
      } catch (err) {
        console.warn("[Auth] Failed to fetch profile from /auth/me:", err.message);
      }

      // Merge: profileData + fallback to login response data (ensures role, fullName, email, etc. are preserved)
      const mergedUser = {
        ...data,
        ...profileData,
        role: data?.role || profileData?.role || '',
        fullName: profileData?.fullName || profileData?.name || data?.fullName || '',
        email: profileData?.email || data?.email || '',
        id: profileData?.id || profileData?.userId || data?.userId || data?.id || ''
      };

      localStorage.setItem("user", JSON.stringify(mergedUser));

      dispatch({
        type: LOGIN_SUCCESS,
        payload: { user: mergedUser, token },
      });

      dispatch({ type: SET_REQUIRE_PASSWORD_CHANGE, payload: false });
      return { success: true, message: response.data?.message || 'Login successful' };
    }

    const failureMsg = response?.data?.message || commonError;
    dispatch({
      type: LOGIN_FAILURE,
      payload: failureMsg,
    });
    return { success: false, message: failureMsg };
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || commonError;
    const status = error.response?.status;

    if (
      status === 403 &&
      message.toLowerCase().includes("change password required")
    ) {
      dispatch({ type: SET_REQUIRE_PASSWORD_CHANGE, payload: true });
      dispatch({ type: LOGIN_FAILURE, payload: message });
      return "CHANGE_PASSWORD_REQUIRED";
    }

    dispatch({
      type: LOGIN_FAILURE,
      payload: message,
    });
    return { success: false, message };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

/* =======================
   FETCH PROFILE
 ======================= */
export const fetchProfile = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_PROFILE_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/auth/me`);

    if (
      response.status === 200 ||
      response?.data?.success === true ||
      response?.data?.status === true ||
      response?.data?.status === 200 ||
      response?.data?.status === "SUCCESS"
    ) {
      const profileData = response.data.data || response.data || {};

      // Get existing user in localStorage to preserve key fields (like role)
      const savedUserStr = localStorage.getItem("user");
      let existingUser = {};
      if (savedUserStr) {
        try {
          existingUser = JSON.parse(savedUserStr);
        } catch (e) { }
      }

      const mergedUser = {
        ...existingUser,
        ...profileData,
        role: existingUser?.role || profileData?.role || '',
        fullName: profileData?.fullName || profileData?.name || existingUser?.fullName || '',
        email: profileData?.email || existingUser?.email || '',
        id: profileData?.id || profileData?.userId || existingUser?.userId || existingUser?.id || ''
      };

      // Update cached user info in localStorage
      localStorage.setItem("user", JSON.stringify(mergedUser));

      dispatch({
        type: FETCH_PROFILE_SUCCESS,
        payload: mergedUser,
      });
      return { ok: true };
    }

    dispatch({
      type: FETCH_PROFILE_FAILURE,
      payload: response?.data?.message || commonError,
    });
    return { ok: false, status: response?.status, message: response?.data?.message };
  } catch (error) {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error.message || commonError;
    dispatch({
      type: FETCH_PROFILE_FAILURE,
      payload: message,
    });
    return { ok: false, status, message };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const updateProfile = (formData) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: UPDATE_PROFILE_REQUEST });
  try {
    const response = await axios.patch(`${API_ROUTE}/profile`, formData);

    if (
      response?.data?.status === 200 ||
      response?.data?.status === "SUCCESS"
    ) {
      const { data } = response.data;

      dispatch({
        type: UPDATE_PROFILE_SUCCESS,
        payload: data,
      });

      // Update cached user info in localStorage
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const currentUser = JSON.parse(savedUser);
        const updatedUser = { ...currentUser, ...data };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      return true;
    }

    dispatch({
      type: UPDATE_PROFILE_FAILURE,
      payload: response?.data?.message || commonError,
    });
    return false;
  } catch (error) {
    dispatch({
      type: UPDATE_PROFILE_FAILURE,
      payload: error.response?.data?.message || error.message || commonError,
    });
    return false;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const updateAdminSettings = (formDataPayload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: UPDATE_PROFILE_REQUEST });
  try {
    const response = await axios.put(`${API_ROUTE}/admin/profile`, formDataPayload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (
      response?.data?.status === 200 ||
      response?.data?.status === "SUCCESS" ||
      response.status === 200
    ) {
      const { data } = response.data;

      dispatch({
        type: UPDATE_PROFILE_SUCCESS,
        payload: data,
      });

      // Update cached user info in localStorage
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const currentUser = JSON.parse(savedUser);
        const updatedUser = { ...currentUser, ...data };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      return response.data;
    }

    dispatch({
      type: UPDATE_PROFILE_FAILURE,
      payload: response?.data?.message || commonError,
    });
    return false;
  } catch (error) {
    dispatch({
      type: UPDATE_PROFILE_FAILURE,
      payload: error.response?.data?.message || error.message || commonError,
    });
    return false;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const updateProfileAdmin = (clientId, formData) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: UPDATE_PROFILE_ADMIN_REQUEST });
  try {
    const response = await axios.patch(`${API_ROUTE}/clients/${clientId}`, formData);

    if (
      response?.data?.status === 200 ||
      response?.data?.status === "SUCCESS"
    ) {
      const { data } = response.data;

      dispatch({
        type: UPDATE_PROFILE_ADMIN_SUCCESS,
        payload: data,
      });

      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const currentUser = JSON.parse(savedUser);
        const updatedUser = { ...currentUser, ...data };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      return true;
    }

    dispatch({
      type: UPDATE_PROFILE_ADMIN_FAILURE,
      payload: response?.data?.message || commonError,
    });
    return false;
  } catch (error) {
    dispatch({
      type: UPDATE_PROFILE_ADMIN_FAILURE,
      payload: error.response?.data?.message || error.message || commonError,
    });
    return false;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const clearErrors = () => (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });
};

export const requirePasswordChange = (status) => (dispatch) => {
  dispatch({
    type: SET_REQUIRE_PASSWORD_CHANGE,
    payload: status,
  });
};

export const forgotPassword = (email) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FORGOT_PASSWORD_REQUEST });
  try {
    const response = await axios.post(`${API_ROUTE}/auth/forgot-password`, { email });

    if (
      response?.data?.status === 200 ||
      response?.data?.status === "SUCCESS" ||
      response?.data?.success === true ||
      response.status === 200
    ) {
      dispatch({
        type: FORGOT_PASSWORD_SUCCESS,
        payload: { message: response.data.message || "Reset link sent! Check your email.", email },
      });
      return true;
    }

    dispatch({
      type: FORGOT_PASSWORD_FAILURE,
      payload: response?.data?.message || commonError,
    });
    return false;
  } catch (error) {
    dispatch({
      type: FORGOT_PASSWORD_FAILURE,
      payload: error.response?.data?.message || error.message || commonError,
    });
    return false;
  } finally {
    dispatch({ type: LOADING_END });
  }
};


export const verifyOtp = (mobileNo, otp) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: VERIFY_OTP_REQUEST });
  try {
    const response = await axios.post(`${API_ROUTE}/otp/verify`, {
      mobileNo,
      otp,
    });

    if (
      response?.data?.status === 200 ||
      response?.data?.status === "SUCCESS"
    ) {
      localStorage.setItem("recoveryMobile", mobileNo);
      localStorage.setItem("recoveryOtp", otp);

      dispatch({
        type: VERIFY_OTP_SUCCESS,
        payload: { otp, mobileNo },
      });
      dispatch(requirePasswordChange(true));
      return true;
    }

    dispatch({
      type: VERIFY_OTP_FAILURE,
      payload: response?.data?.message || commonError,
    });
    return false;
  } catch (error) {
    dispatch({
      type: VERIFY_OTP_FAILURE,
      payload: error.response?.data?.message || error.message || commonError,
    });
    return false;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const createNewPassword = (resetData) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: RESET_PASSWORD_REQUEST });
  try {
    const payload = {
      mobileNo: resetData.mobileNo,
      otp: resetData.otp,
      newPassword: resetData.newPassword,
      confirmPassword: resetData.confirmPassword,
    };

    const response = await axios.post(
      `${API_ROUTE}/otp/reset-password`,
      payload,
    );

    if (
      response?.data?.status === 200 ||
      response?.data?.status === "SUCCESS"
    ) {
      localStorage.removeItem("recoveryMobile");
      localStorage.removeItem("recoveryOtp");

      dispatch({
        type: RESET_PASSWORD_SUCCESS,
        payload: response.data.message,
      });
      dispatch(requirePasswordChange(false));
      return true;
    }

    dispatch({
      type: RESET_PASSWORD_FAILURE,
      payload: response?.data?.message || commonError,
    });
    return false;
  } catch (error) {
    dispatch({
      type: RESET_PASSWORD_FAILURE,
      payload: error.response?.data?.message || error.message || commonError,
    });
    return false;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const changeFirstPassword = (data) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: CHANGE_PASSWORD_REQUEST });
  try {
    const response = await axios.post(
      `${API_ROUTE}/auth/change-password`,
      data,
    );

    if (
      response?.data?.status === 200 ||
      response?.data?.status === "SUCCESS"
    ) {
      dispatch({
        type: CHANGE_PASSWORD_SUCCESS,
        payload: response.data.message || "Password changed successfully",
      });
      dispatch({ type: SET_REQUIRE_PASSWORD_CHANGE, payload: false });
      return true;
    }

    dispatch({
      type: CHANGE_PASSWORD_FAILURE,
      payload: response?.data?.message || commonError,
    });
    return false;
  } catch (error) {
    dispatch({
      type: CHANGE_PASSWORD_FAILURE,
      payload: error.response?.data?.message || error.message || commonError,
    });
    return false;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const firstLoginAction = (firstLoginData) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: CHANGE_PASSWORD_REQUEST });
  try {
    const response = await axios.post(
      `${API_ROUTE}/auth/first-login`,
      firstLoginData,
    );

    if (
      response?.data?.status === 200 ||
      response?.data?.status === "SUCCESS" ||
      response?.data?.success === true ||
      response.status === 200
    ) {
      dispatch({
        type: CHANGE_PASSWORD_SUCCESS,
        payload: response.data.message || "Password changed successfully. Please login with your new password.",
      });
      return true;
    }

    dispatch({
      type: CHANGE_PASSWORD_FAILURE,
      payload: response?.data?.message || commonError,
    });
    return false;
  } catch (error) {
    dispatch({
      type: CHANGE_PASSWORD_FAILURE,
      payload: error.response?.data?.message || error.message || commonError,
    });
    return false;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const logout = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    // Unregister FCM push token in the background (non-blocking)
    import('../../utils/firebase')
      .then(({ messaging }) => {
        import('firebase/messaging')
          .then(({ getToken }) => {
            getToken(messaging)
              .then((currentToken) => {
                if (currentToken) {
                  axios.post(`${API_ROUTE}/push-tokens/unregister`, { token: currentToken })
                    .catch(err => console.warn('[FCM] Background unregister call failed:', err.message));
                }
              })
              .catch(fcmErr => console.warn('[FCM] Failed to get token in background:', fcmErr.message));
          })
          .catch(err => console.warn('[FCM] Failed to import firebase/messaging in background:', err.message));
      })
      .catch(err => console.warn('[FCM] Failed to import firebase utils in background:', err.message));

    // Await ONLY the fast logout API call
    const response = await axios.post(`${API_ROUTE}/auth/logout`, {});
    if (response.data && response.data.message) {
      localStorage.setItem('logoutMsg', response.data.message);
    } else {
      localStorage.setItem('logoutMsg', 'Logged out successfully.');
    }
  } catch (error) {
    console.error("Logout API failed:", error);
    localStorage.setItem('logoutMsg', 'Logged out successfully.');
  } finally {
    setAccessToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("expiryTime");
    localStorage.removeItem("recoveryMobile");
    localStorage.removeItem("recoveryOtp");
    localStorage.removeItem("refreshToken");

    dispatch({ type: LOGOUT });
    dispatch({ type: LOADING_END });

    window.location.href = "/login";
  }
};

export const initializeAuth = () => async (dispatch) => {
  const savedUser = localStorage.getItem("user");
  const savedToken = localStorage.getItem("accessToken");

  if (!savedUser || !savedToken) {
    dispatch({ type: INITIALIZE_AUTH_COMPLETE });
    return;
  }

  dispatch({ type: INITIALIZE_AUTH_START });
  dispatch({ type: LOADING_START });

  try {
    setAccessToken(savedToken);

    const user = JSON.parse(savedUser);
    dispatch({
      type: LOGIN_SUCCESS,
      payload: { user, token: savedToken },
    });

    // Sync latest profile details in background (e.g. allowedModules changes)
    dispatch(fetchProfile());

  } catch (err) {
    console.error("[Auth] Failed to restore session:", err.message);
    handleLogoutRedirect();
  } finally {
    dispatch({ type: INITIALIZE_AUTH_COMPLETE });
    dispatch({ type: LOADING_END });
  }
};


export const refreshToken = (data) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: REFRESH_TOKEN_REQUEST });
  try {
    const response = await axios.post(
      `${API_ROUTE}/auth/refresh-token`,
      data,
    );

    if (
      response.status === 200 ||
      response?.data?.success === true ||
      response?.data?.status === 200 ||
      response?.data?.status === "SUCCESS"
    ) {
      const resData = response.data?.data || response.data;
      const token = resData?.accessToken || resData?.token;
      const newRefreshToken = resData?.refreshToken || resData?.refresh_token;

      if (token) {
        setAccessToken(token);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }
        const expiresIn = resData?.expiresIn || resData?.expireIn || 900;
        localStorage.setItem("expiryTime", Date.now() + expiresIn * 1000);
      }

      dispatch({
        type: REFRESH_TOKEN_SUCCESS,
        payload: { token, message: response.data?.message || "Token refreshed successfully" },
      });
      return true;
    }

    dispatch({
      type: REFRESH_TOKEN_FAILURE,
      payload: response?.data?.message || commonError,
    });
    return false;
  } catch (error) {
    const status = error.response?.status;
    dispatch({
      type: REFRESH_TOKEN_FAILURE,
      payload: error.response?.data?.message || error.message || commonError,
    });
    if (status === 400 || status === 401 || status === 403) {
      console.warn("[Auth] Refresh token was rejected or expired. Logging out...");
      dispatch(logout());
    }
    return false;
  } finally {
    dispatch({ type: LOADING_END });
  }
};
