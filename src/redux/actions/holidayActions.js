import axios from "../../api/axiosInstance";
import { API_ROUTE } from "../../data/env";
import {
  FETCH_HOLIDAYS_REQUEST,
  FETCH_HOLIDAYS_SUCCESS,
  FETCH_HOLIDAYS_FAILURE,
  FETCH_UPCOMING_HOLIDAYS_REQUEST,
  FETCH_UPCOMING_HOLIDAYS_SUCCESS,
  FETCH_UPCOMING_HOLIDAYS_FAILURE,
  FETCH_ACTIVE_UPCOMING_HOLIDAYS_REQUEST,
  FETCH_ACTIVE_UPCOMING_HOLIDAYS_SUCCESS,
  FETCH_ACTIVE_UPCOMING_HOLIDAYS_FAILURE,
  SYNC_HOLIDAYS_REQUEST,
  SYNC_HOLIDAYS_SUCCESS,
  SYNC_HOLIDAYS_FAILURE,
  CREATE_HOLIDAY_REQUEST,
  CREATE_HOLIDAY_SUCCESS,
  CREATE_HOLIDAY_FAILURE,
  UPDATE_HOLIDAY_REQUEST,
  UPDATE_HOLIDAY_SUCCESS,
  UPDATE_HOLIDAY_FAILURE,
  DELETE_HOLIDAY_REQUEST,
  DELETE_HOLIDAY_SUCCESS,
  DELETE_HOLIDAY_FAILURE,
  TOGGLE_HOLIDAY_VISIBILITY_REQUEST,
  TOGGLE_HOLIDAY_VISIBILITY_SUCCESS,
  TOGGLE_HOLIDAY_VISIBILITY_FAILURE,
  CLEAR_HOLIDAY_ERRORS,
  CLEAR_HOLIDAY_SUCCESS,
} from "../actionType/holidayActionType";
import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";

const commonError = "Something went wrong!";

// 1. Fetch all holidays (GET /holidays?country=India)
export const fetchHolidaysAction = (country = "India") => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_HOLIDAYS_REQUEST });
  try {
    const response = await axios.post(`${API_ROUTE}/holidays`, { country });
    const payloadData = response.data?.data || response.data || [];
    dispatch({
      type: FETCH_HOLIDAYS_SUCCESS,
      payload: Array.isArray(payloadData) ? payloadData : [],
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_HOLIDAYS_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 2. Fetch upcoming holidays (GET /holidays/upcoming?country=India)
export const fetchUpcomingHolidaysAction = (country = "India") => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_UPCOMING_HOLIDAYS_REQUEST });
  try {
    const response = await axios.post(`${API_ROUTE}/holidays/upcoming`, { country });
    const payloadData = response.data?.data || response.data || [];
    dispatch({
      type: FETCH_UPCOMING_HOLIDAYS_SUCCESS,
      payload: Array.isArray(payloadData) ? payloadData : [],
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_UPCOMING_HOLIDAYS_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 3. Fetch active upcoming holidays (GET /holidays/upcoming/active?country=India)
export const fetchActiveUpcomingHolidaysAction = (country = "India") => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_ACTIVE_UPCOMING_HOLIDAYS_REQUEST });
  try {
    const response = await axios.post(`${API_ROUTE}/holidays/upcoming/active`, { country });
    const payloadData = response.data?.data || response.data || [];
    dispatch({
      type: FETCH_ACTIVE_UPCOMING_HOLIDAYS_SUCCESS,
      payload: Array.isArray(payloadData) ? payloadData : [],
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_ACTIVE_UPCOMING_HOLIDAYS_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 4. Sync holidays from external API (POST /holidays/sync) — Admin only
export const syncHolidaysAction = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: SYNC_HOLIDAYS_REQUEST });
  try {
    const response = await axios.post(`${API_ROUTE}/holidays/sync`);
    dispatch({
      type: SYNC_HOLIDAYS_SUCCESS,
      payload: response.data?.message || "Holidays synced successfully!",
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: SYNC_HOLIDAYS_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 5. Create manual holiday with JSON body (POST /holidays)
export const createHolidayAction = (payload, photo = null) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: CREATE_HOLIDAY_REQUEST });
  try {
    const sanitizedPayload = { ...payload };
    delete sanitizedPayload.id;
    delete sanitizedPayload.imageUrl;

    const formData = new FormData();
    Object.entries(sanitizedPayload).forEach(([key, val]) => {
      if (val !== null && val !== undefined) {
        formData.append(key, val);
      }
    });
    if (photo) {
      formData.append("photo", photo);
    }

    const response = await axios.post(`${API_ROUTE}/holidays`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    
    const payloadData = response.data?.data || response.data;
    dispatch({
      type: CREATE_HOLIDAY_SUCCESS,
      payload: payloadData,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: CREATE_HOLIDAY_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 6. Update manual holiday (PUT /holidays/:id)
export const updateHolidayAction = (id, payload, photo = null) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: UPDATE_HOLIDAY_REQUEST });
  try {
    const sanitizedPayload = { ...payload };
    delete sanitizedPayload.id;
    delete sanitizedPayload.imageUrl;

    const formData = new FormData();
    Object.entries(sanitizedPayload).forEach(([key, val]) => {
      if (val !== null && val !== undefined) {
        formData.append(key, val);
      }
    });
    if (photo) {
      formData.append("photo", photo);
    }

    const response = await axios.put(`${API_ROUTE}/holidays/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    
    const payloadData = response.data?.data || response.data;
    dispatch({
      type: UPDATE_HOLIDAY_SUCCESS,
      payload: { id, data: payloadData },
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: UPDATE_HOLIDAY_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 7. Delete holiday (DELETE /holidays/:id)
export const deleteHolidayAction = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: DELETE_HOLIDAY_REQUEST });
  try {
    const response = await axios.delete(`${API_ROUTE}/holidays/${id}`);
    dispatch({
      type: DELETE_HOLIDAY_SUCCESS,
      payload: id,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: DELETE_HOLIDAY_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 8. Toggle holiday visibility (PATCH /holidays/:id/toggle-visibility)
export const toggleHolidayVisibilityAction = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: TOGGLE_HOLIDAY_VISIBILITY_REQUEST });
  try {
    const response = await axios.patch(`${API_ROUTE}/holidays/${id}/toggle-visibility`);
    const payloadData = response.data?.data || response.data;
    dispatch({
      type: TOGGLE_HOLIDAY_VISIBILITY_SUCCESS,
      payload: { id, data: payloadData },
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: TOGGLE_HOLIDAY_VISIBILITY_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 9. Clear errors
export const clearHolidayErrorsAction = () => (dispatch) => {
  dispatch({ type: CLEAR_HOLIDAY_ERRORS });
};

// 10. Clear success messages
export const clearHolidaySuccessAction = () => (dispatch) => {
  dispatch({ type: CLEAR_HOLIDAY_SUCCESS });
};
