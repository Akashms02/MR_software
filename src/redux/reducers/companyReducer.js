import { COMPANY_ACTIVE_DEATIVE_BUTTON_REQUEST_SUCCESS } from "../actionType/companyActionType";

const initialState = {
  loading: false,
  error: null,
  success: false,
  activeButton: false,
  message: null,
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

    default:
      return state;
  }
};
