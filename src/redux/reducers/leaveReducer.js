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

const initialState = {
  loading: false,
  error: null,
  success: null,

  // My leave requests
  leaves: [],

  // Team leave requests (for managers/admin)
  teamLeaves: [],

  // Leave types (categories)
  leaveTypes: [],

  // My leave balances
  myBalances: [],

  // Employee balances (Admin)
  employeeBalances: [],

  // Admin balance summary
  adminBalanceSummary: null,

  // Admin this-month summary
  adminThisMonthSummary: null,

  // Admin leaves table
  adminLeavesTable: [],

  // Admin leaves summary (counts)
  adminLeavesSummary: null,
};

export const leaveReducer = (state = initialState, action) => {
  switch (action.type) {
    // ─── Loading / Request ────────────────────────────────────────────────
    case FETCH_MY_LEAVES_REQUEST:
    case APPLY_LEAVE_REQUEST:
    case FETCH_TEAM_LEAVES_REQUEST:
    case REVIEW_LEAVE_REQUEST:
    case FETCH_LEAVE_TYPES_REQUEST:
    case CREATE_LEAVE_TYPE_REQUEST:
    case UPDATE_LEAVE_TYPE_REQUEST:
    case DELETE_LEAVE_TYPE_REQUEST:
    case FETCH_MY_BALANCES_REQUEST:
    case FETCH_EMPLOYEE_BALANCES_REQUEST:
    case FETCH_ADMIN_BALANCE_SUMMARY_REQUEST:
    case FETCH_ADMIN_THIS_MONTH_SUMMARY_REQUEST:
    case FETCH_ADMIN_LEAVES_TABLE_REQUEST:
    case FETCH_ADMIN_LEAVES_SUMMARY_REQUEST:
      return { ...state, loading: true, error: null };

    // ─── My Leaves ────────────────────────────────────────────────────────
    case FETCH_MY_LEAVES_SUCCESS:
      return {
        ...state,
        loading: false,
        leaves: Array.isArray(action.payload) ? action.payload : [],
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

    // ─── Team Leaves ──────────────────────────────────────────────────────
    case FETCH_TEAM_LEAVES_SUCCESS:
      return {
        ...state,
        loading: false,
        teamLeaves: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };

    case REVIEW_LEAVE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: `Leave request ${action.payload.status?.toLowerCase()}!`,
        teamLeaves: state.teamLeaves.map((l) =>
          (l.leaveId || l.id) === action.payload.leaveId
            ? { ...l, status: action.payload.status, managerRemarks: action.payload.remarks }
            : l
        ),
        adminLeavesTable: state.adminLeavesTable.map((l) =>
          (l.leaveId || l.id) === action.payload.leaveId
            ? { ...l, status: action.payload.status, managerRemarks: action.payload.remarks }
            : l
        ),
        error: null,
      };

    // ─── Leave Types ──────────────────────────────────────────────────────
    case FETCH_LEAVE_TYPES_SUCCESS:
      return {
        ...state,
        loading: false,
        leaveTypes: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };

    case CREATE_LEAVE_TYPE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: "Leave type created successfully!",
        leaveTypes: action.payload
          ? [...state.leaveTypes, action.payload]
          : state.leaveTypes,
        error: null,
      };

    case UPDATE_LEAVE_TYPE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: "Leave type updated successfully!",
        leaveTypes: state.leaveTypes.map((lt) =>
          lt.id === action.payload.id
            ? { ...lt, ...action.payload.data }
            : lt
        ),
        error: null,
      };

    case DELETE_LEAVE_TYPE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: "Leave type deleted successfully!",
        leaveTypes: state.leaveTypes.filter((lt) => lt.id !== action.payload),
        error: null,
      };

    // ─── Balances ─────────────────────────────────────────────────────────
    case FETCH_MY_BALANCES_SUCCESS:
      return {
        ...state,
        loading: false,
        myBalances: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };

    case FETCH_EMPLOYEE_BALANCES_SUCCESS:
      return {
        ...state,
        loading: false,
        employeeBalances: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };

    case FETCH_ADMIN_BALANCE_SUMMARY_SUCCESS:
      return {
        ...state,
        loading: false,
        adminBalanceSummary: action.payload,
        error: null,
      };

    case FETCH_ADMIN_THIS_MONTH_SUMMARY_SUCCESS:
      return {
        ...state,
        loading: false,
        adminThisMonthSummary: action.payload,
        error: null,
      };

    // ─── Admin Leaves Table & Summary ─────────────────────────────────────
    case FETCH_ADMIN_LEAVES_TABLE_SUCCESS:
      return {
        ...state,
        loading: false,
        adminLeavesTable: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };

    case FETCH_ADMIN_LEAVES_SUMMARY_SUCCESS:
      return {
        ...state,
        loading: false,
        adminLeavesSummary: action.payload,
        error: null,
      };

    // ─── Failures ─────────────────────────────────────────────────────────
    case FETCH_MY_LEAVES_FAILURE:
    case APPLY_LEAVE_FAILURE:
    case FETCH_TEAM_LEAVES_FAILURE:
    case REVIEW_LEAVE_FAILURE:
    case FETCH_LEAVE_TYPES_FAILURE:
    case CREATE_LEAVE_TYPE_FAILURE:
    case UPDATE_LEAVE_TYPE_FAILURE:
    case DELETE_LEAVE_TYPE_FAILURE:
    case FETCH_MY_BALANCES_FAILURE:
    case FETCH_EMPLOYEE_BALANCES_FAILURE:
    case FETCH_ADMIN_BALANCE_SUMMARY_FAILURE:
    case FETCH_ADMIN_THIS_MONTH_SUMMARY_FAILURE:
    case FETCH_ADMIN_LEAVES_TABLE_FAILURE:
    case FETCH_ADMIN_LEAVES_SUMMARY_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ─── Clear ────────────────────────────────────────────────────────────
    case CLEAR_LEAVE_ERRORS:
      return { ...state, error: null };

    case CLEAR_LEAVE_SUCCESS:
      return { ...state, success: null };

    default:
      return state;
  }
};
