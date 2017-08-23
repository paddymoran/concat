const DEFAULT_STATE: Sign.Modals = {};

export default function modals(state: Sign.Modals = DEFAULT_STATE, action: any) {
    switch (action.type) {
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
                documentSetId: action.payload.documentSetId
            };

        case Sign.Actions.Types.SHOW_SUBMIT_CONFIRMATION_MODAL:
            return {
                ...state,
                showing: Sign.ModalType.SUBMIT_CONFIRMATION,
                documentSetId: action.payload.documentSetId
            };

        case Sign.Actions.Types.CLOSE_SHOWING_MODAL:
            if (action.payload.modalName === state.showing) {
                return DEFAULT_STATE;
            }

            return state;

        default:
            return state;
    }
}