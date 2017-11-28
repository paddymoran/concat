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
                message: action.payload.message,
                title: action.payload.title,
                type: action.payload.type
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
            return {
                ...state,
                ...action.payload,
                showing: Sign.ModalType.ACTIVATE_CONTROL,
            };

        case Sign.Actions.Types.CONFIRM_ACTION:
            return {
                ...state,
                ...action.payload,
                showing: Sign.ModalType.CONFIRM_ACTION,
            };

        case Sign.Actions.Types.SHOW_SIGNING_COMPLETE_MODAL:
            return {
                ...state,
                ...action.payload,
                showing: Sign.ModalType.SIGNING_COMPLETE,
            };

        case Sign.Actions.Types.SHOW_DOWNLOAD_ALL_MODAL:
            return {
                ...state,
                ...action.payload,
                showing: Sign.ModalType.DOWNLOAD_ALL
            };

        case Sign.Actions.Types.SHOW_INVITE_TOKENS_MODAL:
            return {
                ...state,
                ...action.payload,
                showing: Sign.ModalType.INVITE_TOKENS
            };

        case Sign.Actions.Types.SHOW_SESSION_ENDED_MODAL:
            return {
                ...state,
                ...action.payload,
                showing: Sign.ModalType.SESSION_ENDED
            };
        default:
            return state;
    }
}