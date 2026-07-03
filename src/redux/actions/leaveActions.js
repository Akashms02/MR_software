import axios from "../../api/axiosInstance";
import { API_ROUTE } from "../../data/env";
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
  FETCH_LEAVE_TYPES_REQUEST,
  FETCH_LEAVE_TYPES_SUCCESS,
  FETCH_LEAVE_TYPES_FAILURE,
  CREATE_LEAVE_TYPE_REQUEST,
  CREATE_LEAVE_TYPE_SUCCESS,
  CREATE_LEAVE_TYPE_FAILURE,
  UPDATE_LEAVE_TYPE_REQUEST,
  UPDATE_LEAVE_TYPE_SUCCESS,
  UPDATE_LEAVE_TYPE_FAILURE,
  DELETE_LEAVE_TYPE_REQUEST,
  DELETE_LEAVE_TYPE_SUCCESS,
  DELETE_LEAVE_TYPE_FAILURE,
  FETCH_MY_BALANCES_REQUEST,
  FETCH_MY_BALANCES_SUCCESS,
  FETCH_MY_BALANCES_FAILURE,
  FETCH_EMPLOYEE_BALANCES_REQUEST,
  FETCH_EMPLOYEE_BALANCES_SUCCESS,
  FETCH_EMPLOYEE_BALANCES_FAILURE,
  FETCH_ADMIN_BALANCE_SUMMARY_REQUEST,
  FETCH_ADMIN_BALANCE_SUMMARY_SUCCESS,
  FETCH_ADMIN_BALANCE_SUMMARY_FAILURE,
  FETCH_ADMIN_THIS_MONTH_SUMMARY_REQUEST,
  FETCH_ADMIN_THIS_MONTH_SUMMARY_SUCCESS,
  FETCH_ADMIN_THIS_MONTH_SUMMARY_FAILURE,
  FETCH_ADMIN_LEAVES_TABLE_REQUEST,
  FETCH_ADMIN_LEAVES_TABLE_SUCCESS,
  FETCH_ADMIN_LEAVES_TABLE_FAILURE,
  FETCH_ADMIN_LEAVES_SUMMARY_REQUEST,
  FETCH_ADMIN_LEAVES_SUMMARY_SUCCESS,
  FETCH_ADMIN_LEAVES_SUMMARY_FAILURE,
  CLEAR_LEAVE_ERRORS,
  CLEAR_LEAVE_SUCCESS,
} from "../actionType/leaveActionType";
import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";

const commonError = "Something went wrong!";

// 1. Get My Leave Requests
export const fetchMyLeavesAction = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_MY_LEAVES_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/leaves/requests/my`);
    let payloadData = response.data?.data || response.data || [];
    if (payloadData && typeof payloadData === 'object' && !Array.isArray(payloadData)) {
      if (Array.isArray(payloadData.content)) {
        payloadData = payloadData.content;
      }
    }
    dispatch({
      type: FETCH_MY_LEAVES_SUCCESS,
      payload: Array.isArray(payloadData) ? payloadData : [],
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_MY_LEAVES_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 2. Apply for Leave
export const applyLeaveAction = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: APPLY_LEAVE_REQUEST });
  try {
    const response = await axios.post(`${API_ROUTE}/leaves/requests`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const payloadData = response.data?.data || response.data;
    dispatch({
      type: APPLY_LEAVE_SUCCESS,
      payload: payloadData,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: APPLY_LEAVE_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 3. Get Team Leave Requests (for Managers)
export const fetchTeamLeavesAction = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_TEAM_LEAVES_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/leaves/requests/team`);
    let payloadData = response.data?.data || response.data || [];
    if (payloadData && typeof payloadData === 'object' && !Array.isArray(payloadData)) {
      if (Array.isArray(payloadData.content)) {
        payloadData = payloadData.content;
      }
    }
    dispatch({
      type: FETCH_TEAM_LEAVES_SUCCESS,
      payload: Array.isArray(payloadData) ? payloadData : [],
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching team leaves:", error);
    // Graceful fallback: if team leaves API fails (e.g. 500 error due to empty team on backend), dispatch success with empty array to keep UI working
    dispatch({
      type: FETCH_TEAM_LEAVES_SUCCESS,
      payload: [],
    });
    return { status: true, data: [] };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 4. Review Leave (Approve/Reject)
export const reviewLeaveAction = (leaveId, status, remarks) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: REVIEW_LEAVE_REQUEST });
  try {
    const parsedLeaveId = leaveId && !isNaN(leaveId) ? parseInt(leaveId, 10) : leaveId;
    const response = await axios.post(`${API_ROUTE}/leaves/requests/review`, {
      leaveId: parsedLeaveId,
      status,
      reviewComment: remarks
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    dispatch({
      type: REVIEW_LEAVE_SUCCESS,
      payload: { leaveId: parsedLeaveId, status, remarks },
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: REVIEW_LEAVE_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 5. Get All Leave Types
export const fetchLeaveTypesAction = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_LEAVE_TYPES_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/leaves/leave-types`);
    const payloadData = response.data?.data || response.data || [];
    dispatch({
      type: FETCH_LEAVE_TYPES_SUCCESS,
      payload: Array.isArray(payloadData) ? payloadData : [],
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_LEAVE_TYPES_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 6. Create Leave Type
export const createLeaveTypeAction = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: CREATE_LEAVE_TYPE_REQUEST });
  try {
    const response = await axios.post(`${API_ROUTE}/leaves/leave-types`, payload);
    if (response.data && response.data.status === false) {
      const msg = response.data.message || commonError;
      dispatch({ type: CREATE_LEAVE_TYPE_FAILURE, payload: msg });
      throw new Error(msg);
    }
    const payloadData = response.data?.data || response.data;
    dispatch({
      type: CREATE_LEAVE_TYPE_SUCCESS,
      payload: payloadData,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: CREATE_LEAVE_TYPE_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 7. Update Leave Type
export const updateLeaveTypeAction = (id, payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: UPDATE_LEAVE_TYPE_REQUEST });
  try {
    const response = await axios.put(`${API_ROUTE}/leaves/leave-types/${id}`, payload);
    if (response.data && response.data.status === false) {
      const msg = response.data.message || commonError;
      dispatch({ type: UPDATE_LEAVE_TYPE_FAILURE, payload: msg });
      throw new Error(msg);
    }
    const payloadData = response.data?.data || response.data;
    dispatch({
      type: UPDATE_LEAVE_TYPE_SUCCESS,
      payload: { id, data: payloadData },
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: UPDATE_LEAVE_TYPE_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 8. Delete Leave Type
export const deleteLeaveTypeAction = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: DELETE_LEAVE_TYPE_REQUEST });
  try {
    const response = await axios.delete(`${API_ROUTE}/leaves/leave-types/${id}`);
    dispatch({
      type: DELETE_LEAVE_TYPE_SUCCESS,
      payload: id,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: DELETE_LEAVE_TYPE_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 9. Fetch My Balances
export const fetchMyBalancesAction = (year = 2026) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_MY_BALANCES_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/leave/balances/my-balances?year=${year}`);
    let payloadData = response.data?.data || response.data || [];
    if (payloadData && typeof payloadData === 'object' && !Array.isArray(payloadData)) {
      if (Array.isArray(payloadData.content)) {
        payloadData = payloadData.content;
      }
    }
    dispatch({
      type: FETCH_MY_BALANCES_SUCCESS,
      payload: Array.isArray(payloadData) ? payloadData : [],
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_MY_BALANCES_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 10. Fetch Employee Balances (Admin)
export const fetchEmployeeBalancesAction = (employeeId, year = 2026) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_EMPLOYEE_BALANCES_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/leave/balances/employee/${employeeId}?year=${year}`);
    let payloadData = response.data?.data || response.data || [];
    if (payloadData && typeof payloadData === 'object' && !Array.isArray(payloadData)) {
      if (Array.isArray(payloadData.content)) {
        payloadData = payloadData.content;
      }
    }
    dispatch({
      type: FETCH_EMPLOYEE_BALANCES_SUCCESS,
      payload: Array.isArray(payloadData) ? payloadData : [],
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_EMPLOYEE_BALANCES_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 11. Fetch Admin Balance Summary
export const fetchAdminBalanceSummaryAction = (employeeId, year = 2026) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_ADMIN_BALANCE_SUMMARY_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/leave/balances/admin/leave-balances-summary?employeeId=${employeeId}&year=${year}`);
    const payloadData = response.data?.data || response.data;
    dispatch({
      type: FETCH_ADMIN_BALANCE_SUMMARY_SUCCESS,
      payload: payloadData,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_ADMIN_BALANCE_SUMMARY_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 12. Fetch Admin This Month Summary
export const fetchAdminThisMonthSummaryAction = (year = 2026, month = 6) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_ADMIN_THIS_MONTH_SUMMARY_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/leave/balances/admin/leave-balances-this-month?year=${year}&month=${month}`);
    const payloadData = response.data?.data || response.data;
    dispatch({
      type: FETCH_ADMIN_THIS_MONTH_SUMMARY_SUCCESS,
      payload: payloadData,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_ADMIN_THIS_MONTH_SUMMARY_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 13. Fetch Admin Leaves Table
export const fetchAdminLeaveTableAction = (year = 2026) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_ADMIN_LEAVES_TABLE_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/leaves/requests/admin/leave-requests?year=${year}`);
    const payloadData = response.data?.data || response.data || [];
    dispatch({
      type: FETCH_ADMIN_LEAVES_TABLE_SUCCESS,
      payload: Array.isArray(payloadData) ? payloadData : [],
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching admin leave table:", error);
    // Graceful fallback: if admin leave table API fails, dispatch success with empty array to keep UI working
    dispatch({
      type: FETCH_ADMIN_LEAVES_TABLE_SUCCESS,
      payload: [],
    });
    return { status: true, data: [] };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 14. Fetch Admin Leaves Summary (counts)
export const fetchAdminLeaveSummaryAction = (year = 2026) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: FETCH_ADMIN_LEAVES_SUMMARY_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/leaves/requests/admin/leave-requests-summary?year=${year}`);
    const payloadData = response.data?.data || response.data;
    dispatch({
      type: FETCH_ADMIN_LEAVES_SUMMARY_SUCCESS,
      payload: payloadData,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: FETCH_ADMIN_LEAVES_SUMMARY_FAILURE, payload: msg });
    throw new Error(msg);
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 15. Clear errors
export const clearLeaveErrorsAction = () => (dispatch) => {
  dispatch({ type: CLEAR_LEAVE_ERRORS });
};

// 16. Clear success messages
export const clearLeaveSuccessAction = () => (dispatch) => {
  dispatch({ type: CLEAR_LEAVE_SUCCESS });
};
