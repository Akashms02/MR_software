import {
  COMPANY_ACTIVE_DEATIVE_BUTTON_REQUEST_SUCCESS,
  COMPANY_EDIT_DATA_REQUEST_SUCCESS,
} from "../actionType/companyActionType";

const initialState = {
  loading: false,
  error: null,
  success: false,
  message: null,
  activeButton: false,
  updateData: null,
};

export const companyReducer = (state = initialState, action) => {
  switch (action.type) {
    case COMPANY_ACTIVE_DEATIVE_BUTTON_REQUEST_SUCCESS:
      return {
        ...state,
        loading: false,
        activeButton: action?.payload,
        error: null,
      };
    case COMPANY_EDIT_DATA_REQUEST_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        updateData: action?.payload,
        message:
          action?.payload?.message || "Company data updated successfully",
        error: null,
      };
    default:
      return state;
  }
};
