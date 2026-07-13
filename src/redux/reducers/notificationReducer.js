import {
  FETCH_NOTIFICATIONS_REQUEST,
  FETCH_NOTIFICATIONS_SUCCESS,
  FETCH_NOTIFICATIONS_FAILURE,
  FETCH_UNREAD_NOTIFICATIONS_REQUEST,
  FETCH_UNREAD_NOTIFICATIONS_SUCCESS,
  FETCH_UNREAD_NOTIFICATIONS_FAILURE,
  FETCH_UNREAD_COUNT_SUCCESS,
  FETCH_UNREAD_COUNT_FAILURE,
  MARK_NOTIFICATION_READ_REQUEST,
  MARK_NOTIFICATION_READ_SUCCESS,
  MARK_NOTIFICATION_READ_FAILURE,
  MARK_ALL_READ_REQUEST,
  MARK_ALL_READ_SUCCESS,
  MARK_ALL_READ_FAILURE,
  DELETE_NOTIFICATION_REQUEST,
  DELETE_NOTIFICATION_SUCCESS,
  DELETE_NOTIFICATION_FAILURE,
  CLEAR_ERRORS,
  CLEAR_SUCCESS,
  RECEIVE_NOTIFICATION
} from '../actionType/notificationActionType';
import { LOADING_START, LOADING_END } from '../actionType/loadingActionType';

const initialState = {
  loading: false,
  error: null,
  success: null,
  notifications: [],
  unreadNotifications: [],
  unreadCount: 0,
};

export const notificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOADING_START:
    case FETCH_NOTIFICATIONS_REQUEST:
    case FETCH_UNREAD_NOTIFICATIONS_REQUEST:
    case MARK_NOTIFICATION_READ_REQUEST:
    case MARK_ALL_READ_REQUEST:
    case DELETE_NOTIFICATION_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case LOADING_END:
      return {
        ...state,
        loading: false,
      };

    case FETCH_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        notifications: Array.isArray(action.payload) ? action.payload : [],
        // Fallback calculation of unread count if API isn't updated yet
        unreadCount: Array.isArray(action.payload) 
          ? action.payload.filter(n => n.read === false || n.isRead === false).length 
          : 0,
      };

    case FETCH_UNREAD_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        unreadNotifications: Array.isArray(action.payload) ? action.payload : [],
        unreadCount: Array.isArray(action.payload) ? action.payload.length : 0,
      };

    case FETCH_UNREAD_COUNT_SUCCESS:
      return {
        ...state,
        error: null,
        unreadCount: action.payload ?? 0,
      };

    case RECEIVE_NOTIFICATION: {
      const exists = state.notifications.some(
        (n) => n.id === action.payload.id || n._id === action.payload._id
      );
      if (exists) return state;
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    }

    case MARK_NOTIFICATION_READ_SUCCESS: {
      const updatedNotifications = state.notifications.map(n => 
        n.id === action.payload || n._id === action.payload
          ? { ...n, read: true, isRead: true } 
          : n
      );
      return {
        ...state,
        loading: false,
        error: null,
        notifications: updatedNotifications,
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    }

    case MARK_ALL_READ_SUCCESS: {
      const updatedNotifications = state.notifications.map(n => ({
        ...n,
        read: true,
        isRead: true,
      }));
      return {
        ...state,
        loading: false,
        error: null,
        notifications: updatedNotifications,
        unreadCount: 0,
      };
    }

    case DELETE_NOTIFICATION_SUCCESS: {
      const targetId = action.payload;
      const isUnread = state.notifications.some(n => 
        (n.id === targetId || n._id === targetId) && (n.read === false || n.isRead === false)
      );
      const updatedNotifications = state.notifications.filter(n => 
        n.id !== targetId && n._id !== targetId
      );
      return {
        ...state,
        loading: false,
        error: null,
        notifications: updatedNotifications,
        unreadCount: isUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    }

    case FETCH_NOTIFICATIONS_FAILURE:
    case FETCH_UNREAD_NOTIFICATIONS_FAILURE:
    case FETCH_UNREAD_COUNT_FAILURE:
    case MARK_NOTIFICATION_READ_FAILURE:
    case MARK_ALL_READ_FAILURE:
    case DELETE_NOTIFICATION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
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
      };

    default:
      return state;
  }
};
