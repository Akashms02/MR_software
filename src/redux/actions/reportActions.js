import axios from "../../api/axiosInstance";
import { API_ROUTE } from "../../data/env";
import {
  GET_VISIT_SUMMARY_REQUEST,
  GET_VISIT_SUMMARY_SUCCESS,
  GET_VISIT_SUMMARY_FAILURE,
  GET_DATEWISE_DAILY_REQUEST,
  GET_DATEWISE_DAILY_SUCCESS,
  GET_DATEWISE_DAILY_FAILURE,
  GET_CALL_VISIT_REQUEST,
  GET_CALL_VISIT_SUCCESS,
  GET_CALL_VISIT_FAILURE,
  GET_DCR_DAY_REQUEST,
  GET_DCR_DAY_SUCCESS,
  GET_DCR_DAY_FAILURE,
  GET_DAILY_ACTIVITY_REQUEST,
  GET_DAILY_ACTIVITY_SUCCESS,
  GET_DAILY_ACTIVITY_FAILURE,
  GET_WEEKLY_CROSS_REQUEST,
  GET_WEEKLY_CROSS_SUCCESS,
  GET_WEEKLY_CROSS_FAILURE,
  CLEAR_REPORT_ERRORS,
  DISTRIBUTES_REPORT_REQUEST,
  DISTRIBUTES_REPORT_FAILURE,
  DISTRIBUTES_REPORT_SUCCESS,
  GET_DISTRIBUTORS_REQUEST,
  GET_DISTRIBUTORS_SUCCESS,
  GET_DISTRIBUTORS_FAILURE,
} from "../actionType/reportActionType";
import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";

const commonError = "Something went wrong!";
const isSuccess = (status) => status === 200 || status === 201 || status === "SUCCESS" || status === true;

export const clearReportErrors = () => (dispatch) => {
  dispatch({ type: CLEAR_REPORT_ERRORS });
};

// 1. Visit Summary
export const getVisitSummary = (mrId, startDate, endDate, page = 1, size = 10) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: GET_VISIT_SUMMARY_REQUEST });
  try {
    const response = await axios.post(
      `${API_ROUTE}/reports/visit-summary`,
      { mrId, startDate, endDate, page: page - 1, size }
    );
    const { status, message, data } = response.data ?? {};
    if (isSuccess(status) || response.status === 200) {
      const totalWorkingDays = data?.data?.totalWorkingDays || 0;
      const totalVisits = data?.data?.totalVisits || 0;
      const totalChemistVisits = data?.data?.totalChemistVisits || 0;
      const uniqueDoctorsVisited = data?.data?.uniqueDoctorsVisited || 0;
      const dcrs = data?.data?.dcrsPage?.content || [];
      const paginator = data?.data?.dcrsPage?.paginator || null;
      const totalDcrs = data?.data?.dcrsPage?.total || 0;

      const formatted = {
        totalWorkingDays,
        totalVisits,
        totalChemistVisits,
        uniqueDoctorsVisited,
        dcrs,
        paginator,
        totalDcrs,
        totalPlanned: totalWorkingDays, // legacy map to planned card
        totalCompleted: totalVisits,    // legacy map to completed card
        successRate: totalWorkingDays ? `${Math.round((totalVisits / totalWorkingDays) * 100)}%` : '0%',
        territories: [] // no territory breakdown in live API, empty to hide cleanly
      };

      dispatch({
        type: GET_VISIT_SUMMARY_SUCCESS,
        payload: formatted,
      });
      return { success: true, data: formatted };
    }
    dispatch({
      type: GET_VISIT_SUMMARY_FAILURE,
      payload: message || commonError,
    });
    return { success: false, error: message || commonError };
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: GET_VISIT_SUMMARY_FAILURE, payload: errMsg });
    return { success: false, error: errMsg };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 2. Datewise Daily Report
export const getDatewiseDaily = (mrId, startDate, endDate, page = 1, size = 10) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: GET_DATEWISE_DAILY_REQUEST });
  try {
    const response = await axios.post(
      `${API_ROUTE}/reports/datewise-daily`,
      { mrId, startDate, endDate, page: page - 1, size }
    );
    const { status, message, data } = response.data ?? {};
    if (isSuccess(status) || response.status === 200) {
      // API now returns paginated datewisePage.content (array of {date, doctorVisitCount, chemistVisitCount, dcrStatus})
      const pageContent = data?.data?.datewisePage?.content || [];
      const paginator  = data?.data?.datewisePage?.paginator || null;
      const total = data?.data?.datewisePage?.total || 0;
      const formatted = pageContent.map((entry) => ({
        date: entry.date,
        visits: entry.doctorVisitCount || 0,
        chemistCalls: entry.chemistVisitCount || 0,
        calls: entry.doctorVisitCount || 0,
        dcrStatus: entry.dcrStatus || 'PENDING',
        travelKm: 0
      }));

      const result = {
        list: formatted,
        totalWorkingDays: data?.data?.totalWorkingDays || 0,
        grandTotalDoctorVisits: data?.data?.grandTotalDoctorVisits || 0,
        paginator,
        total
      };

      dispatch({
        type: GET_DATEWISE_DAILY_SUCCESS,
        payload: result,
      });
      return { success: true, data: result };
    }
    dispatch({
      type: GET_DATEWISE_DAILY_FAILURE,
      payload: message || commonError,
    });
    return { success: false, error: message || commonError };
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: GET_DATEWISE_DAILY_FAILURE, payload: errMsg });
    return { success: false, error: errMsg };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 3. Call Visit Report
export const getCallVisit = (mrId, startDate, endDate, page = 1, size = 10) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: GET_CALL_VISIT_REQUEST });
  try {
    const response = await axios.post(
      `${API_ROUTE}/reports/call-visit`,
      { mrId, startDate, endDate, page: page - 1, size }
    );
    const { status, message, data } = response.data ?? {};
    if (isSuccess(status) || response.status === 200) {
      // API now returns paginated callsPage.content
      const pageContent = data?.data?.callsPage?.content || [];
      const paginator  = data?.data?.callsPage?.paginator || null;
      const total = data?.data?.callsPage?.total || 0;
      const formatted = pageContent.map((call) => ({
        date: call.date,
        doctorId: call.doctorId,
        doctorName: call.doctorName,
        speciality: call.speciality,
        visitTime: call.visitTime,
        time: call.visitTime || call.time || '', // fallback
        productsDiscussed: call.productsDiscussed,
        products: call.productsDiscussed || call.products || '', // fallback
        samplesGiven: call.samplesGiven || null,
        feedback: call.feedback || '',
        gpsVerified: call.gpsVerified || false
      }));

      const result = {
        list: formatted,
        totalCalls: data?.data?.totalCalls || 0,
        paginator,
        total
      };

      dispatch({
        type: GET_CALL_VISIT_SUCCESS,
        payload: result,
      });
      return { success: true, data: result };
    }
    dispatch({
      type: GET_CALL_VISIT_FAILURE,
      payload: message || commonError,
    });
    return { success: false, error: message || commonError };
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: GET_CALL_VISIT_FAILURE, payload: errMsg });
    return { success: false, error: errMsg };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 4. DCR Day Report
export const getDcrDay = (mrId, date) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: GET_DCR_DAY_REQUEST });
  try {
    const response = await axios.post(
      `${API_ROUTE}/reports/dcr-day`,
      { mrId, date }
    );
    const { status, message, data } = response.data ?? {};
    if (isSuccess(status) || response.status === 200) {
      const innerData = data?.data || {};
      const formatted = {
        date: data?.startDate || date,
        dcrId: innerData.dcrId || null,
        status: innerData.status || 'NO_REPORT',
        managerRemarks: innerData.managerRemarks || '',
        totalDoctorVisits: innerData.totalDoctorVisits || 0,
        totalChemistVisits: innerData.totalChemistVisits || 0,
        gpsVerifiedVisits: innerData.gpsVerifiedVisits || 0,
        // legacy field aliases for backward compat with existing UI
        totalVisits: innerData.totalDoctorVisits || 0
      };
      dispatch({
        type: GET_DCR_DAY_SUCCESS,
        payload: formatted,
      });
      return { success: true, data: formatted };
    }
    dispatch({
      type: GET_DCR_DAY_FAILURE,
      payload: message || commonError,
    });
    return { success: false, error: message || commonError };
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: GET_DCR_DAY_FAILURE, payload: errMsg });
    return { success: false, error: errMsg };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 5. Daily Activity Summary
export const getDailyActivity = (mrId, date) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: GET_DAILY_ACTIVITY_REQUEST });
  try {
    const response = await axios.post(
      `${API_ROUTE}/reports/daily-activity`,
      { mrId, date }
    );
    const { status, message, data } = response.data ?? {};
    if (isSuccess(status) || response.status === 200) {
      const innerData = data?.data || {};
      const formatted = {
        date: data?.startDate || date,
        dcrId: innerData.dcrId || null,
        dcrStatus: innerData.dcrStatus || innerData.status || 'NO_REPORT',
        totalDoctorVisits: innerData.totalDoctorVisits || 0,
        totalChemistVisits: innerData.totalChemistVisits || 0,
        totalSamplesCount: innerData.totalSamplesCount || 0,
        totalSamplesDistributed: innerData.totalSamplesDistributed || [],
        status: innerData.status || 'NO_REPORT',
        summary: {
          workingStatus: (innerData.totalDoctorVisits || 0) > 0 ? 'Present' : 'Absent/No Activity',
          totalVisits: innerData.totalDoctorVisits || 0,
          productiveVisits: innerData.totalDoctorVisits || 0,
          nonProductiveVisits: 0
        }
      };
      dispatch({
        type: GET_DAILY_ACTIVITY_SUCCESS,
        payload: formatted,
      });
      return { success: true, data: formatted };
    }
    dispatch({
      type: GET_DAILY_ACTIVITY_FAILURE,
      payload: message || commonError,
    });
    return { success: false, error: message || commonError };
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: GET_DAILY_ACTIVITY_FAILURE, payload: errMsg });
    return { success: false, error: errMsg };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 6. Weekly Cross Report
export const getWeeklyCross = (mrId, dateInWeek) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: GET_WEEKLY_CROSS_REQUEST });
  try {
    const response = await axios.post(
      `${API_ROUTE}/reports/weekly-cross`,
      { mrId, dateInWeek }
    );
    const { status, message, data } = response.data ?? {};
    if (isSuccess(status) || response.status === 200) {
      const daysMap = {
        "MONDAY": "Monday",
        "TUESDAY": "Tuesday",
        "WEDNESDAY": "Wednesday",
        "THURSDAY": "Thursday",
        "FRIDAY": "Friday",
        "SATURDAY": "Saturday",
        "SUNDAY": "Sunday"
      };
      const formatted = Object.entries(data?.data?.weeklyMatrix || {}).map(([dayKey, dayData]) => ({
        day: daysMap[dayKey] || dayKey,
        date: dayData?.date || null,
        territory: 'N/A',
        doctorVisits: dayData?.doctorVisitCount || 0,
        chemistCalls: dayData?.chemistVisitCount || 0,
        hasDcr: dayData?.hasDcr || false,
        dcrStatus: dayData?.hasDcr ? (dayData?.doctorVisitCount > 0 ? 'COMPLETED' : 'NO_ACTIVITY') : 'NO_REPORT'
      }));

      const result = {
        list: formatted,
        weekTotalDoctorVisits: data?.data?.weekTotalDoctorVisits || 0,
        weekTotalChemistVisits: data?.data?.weekTotalChemistVisits || 0,
        weekStartDate: data?.data?.weekStartDate || '',
        weekEndDate: data?.data?.weekEndDate || '',
      };

      dispatch({
        type: GET_WEEKLY_CROSS_SUCCESS,
        payload: result,
      });
      return { success: true, data: result };
    }
    dispatch({
      type: GET_WEEKLY_CROSS_FAILURE,
      payload: message || commonError,
    });
    return { success: false, error: message || commonError };
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: GET_WEEKLY_CROSS_FAILURE, payload: errMsg });
    return { success: false, error: errMsg };
  } finally {
    dispatch({ type: LOADING_END });
  }
};


export const distributerActivityReport = (params) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: DISTRIBUTES_REPORT_REQUEST });
  try {
    const response = await axios.post(
      `${API_ROUTE}/mr/distributors/sales`,
      params
    );
    const { status, message, data } = response.data ?? {};
    if (isSuccess(status) || response.status === 200) {
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.content)) {
        list = data.content;
      } else if (data && Array.isArray(data.data)) {
        list = data.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        list = response.data.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data.content)) {
        list = response.data.data.content;
      }

      dispatch({
        type: DISTRIBUTES_REPORT_SUCCESS,
        payload: list,
      });
      return { success: true, data: list };
    }
    dispatch({
      type: DISTRIBUTES_REPORT_FAILURE,
      payload: message || commonError,
    });
    return { success: false, error: message || commonError };
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: DISTRIBUTES_REPORT_FAILURE, payload: errMsg });
    return { success: false, error: errMsg };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const getDistributorsList = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: GET_DISTRIBUTORS_REQUEST });
  try {
    const response = await axios.get(`${API_ROUTE}/mr/distributors`);
    const { status, message, data } = response.data ?? {};
    if (isSuccess(status) || response.status === 200) {
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.content)) {
        list = data.content;
      } else if (data && Array.isArray(data.data)) {
        list = data.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        list = response.data.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data.content)) {
        list = response.data.data.content;
      }

      dispatch({
        type: GET_DISTRIBUTORS_SUCCESS,
        payload: list,
      });
      return { success: true, data: list };
    }
    dispatch({
      type: GET_DISTRIBUTORS_FAILURE,
      payload: message || commonError,
    });
    return { success: false, error: message || commonError };
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message || commonError;
    dispatch({ type: GET_DISTRIBUTORS_FAILURE, payload: errMsg });
    return { success: false, error: errMsg };
  } finally {
    dispatch({ type: LOADING_END });
  }
};