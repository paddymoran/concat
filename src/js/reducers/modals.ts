const DEFAULT_STATE: Sign.Modals = {};

export default function modals(state: Sign.Modals = DEFAULT_STATE, action: any) {
    switch (action.type) {
        case Sign.Actions.Types.UPDATE_MODAL_DATA:
            return {
                ...state,
                ...action.payload
            };

        case Sign.Actions.Types.SHOW_SIGNATURE_SELECTION:
            return {
                ...state,
                showing: 'selectSignature'
            };

        case Sign.Actions.Types.SHOW_RESULTS:
            return {
                ...state,
                showing: 'results',
                results: action.payload
            };

        case Sign.Actions.Types.SHOW_INITIAL_SELECTION_MODAL:
            return { ...state, showing: 'selectInitial' };

        case Sign.Actions.Types.SHOW_SIGN_CONFIRMATION_MODAL:
            return {
                ...state,
                showing: Sign.ModalType.SIGN_CONFIRMATION,
                ...action.payload
            };

        case Sign.Actions.Types.SHOW_FAILURE_MODAL:
            return {
                ...state,
                showing: Sign.ModalType.FAILURE,
                message: action.payload.message
            };

        case Sign.Actions.Types.CLOSE_SHOWING_MODAL:
            if (action.payload.modalName === state.showing) {
                return DEFAULT_STATE;
            }
            return state;

        case Sign.Actions.Types.SHOW_INVITE_MODAL:
            return { ...state, showing: Sign.ModalType.INVITE, ...action.payload };

        case Sign.Actions.Types.SHOW_EMAIL_DOCUMENT_MODAL:
            return {
                ...state,
                ...action.payload,
                status: Sign.DownloadStatus.NotStarted,
                showing: Sign.ModalType.EMAIL_DOCUMENT,
            };

        case Sign.Actions.Types.SHOW_ACTIVATE_CONTROL_MODAL:
        case Sign.Actions.Types.CONFIRM_ACTION:
            return {
                ...state,
                ...action.payload,
                showing: action.type,
            }

        default:
            return state;
    }
}