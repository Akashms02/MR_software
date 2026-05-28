import {
  COMPANY_ACTIVE_DEATIVE_BUTTON_REQUEST_SUCCESS,
  COMPANY_EDIT_DATA_REQUEST_SUCCESS,
  COMPANY_OFFER_LETTER_GENERATE_SUCCESS,
  COMPANY_PAYSLIP_GENERATE_SUCCESS,
  COMPANY_RELEIVING_LETTER_GENERATE_SUCCESS,
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
    case COMPANY_PAYSLIP_GENERATE_SUCCESS:
      return {
        ...state,
        loading: false,
        payslipGenerate: action?.payload?.message || "Payslip generated successfully",
        payslipPDF: action?.payload?.data?.payslipPDF,
      }
    case COMPANY_RELEIVING_LETTER_GENERATE_SUCCESS:
      return {
        ...state,
        loading: false,
        releivingLetterGenerate: action?.payload?.message || "Releiving letter generated successfully",
        releivingLetterPDF: action?.payload?.data?.releivingLetterPDF,
      }

    case COMPANY_OFFER_LETTER_GENERATE_SUCCESS:
      return {
        ...state,
        loading: false,
        offerLetterGenerate: action?.payload?.message || "Offer letter generated successfully",
        offerLetterPDF: action?.payload?.data?.offerLetterPDF,
      }

    default:
      return state;
  }
};
