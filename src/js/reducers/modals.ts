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
                documentId: action.payload.documentId,
                documentSetId: action.payload.documentSetId,
                signRequestId: action.payload.signRequestId
            };

        case Sign.Actions.Types.SHOW_SUBMIT_CONFIRMATION_MODAL:
            return {
                ...state,
                showing: Sign.ModalType.SUBMIT_CONFIRMATION,
                documentSetId: action.payload.documentSetId
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

        case Sign.Actions.Types.SHOW_REJECT_CONFIRMATION_MODAL:
            return {
                showing: Sign.ModalType.REJECT_CONFIRMATION,
                ...action.payload
            };

        case Sign.Actions.Types.NEXT_DOCUMENT:
            return {
                showing: Sign.ModalType.NEXT_DOCUMENT,
                ...action.payload
            };

        default:
            return state;
    }
}