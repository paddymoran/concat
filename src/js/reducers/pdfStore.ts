const DEFAULT_STATE: Sign.IPDFStore = {};

export default function pdfStoreReducer(state=DEFAULT_STATE, action: Sign.Actions.IAddPDFToStoreAction) {
    switch (action.type) {
        case Sign.Actions.Types.ADD_PDF_TO_STORE:
            return { ...state, [action.payload.id]: { document: action.payload.document, pages: action.payload.pages } };
        
        default:
            return state;
    }
}