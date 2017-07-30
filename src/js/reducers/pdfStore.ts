const DEFAULT_STATE: Sign.PDFStore = {};

export default function pdfStoreReducer(state=DEFAULT_STATE, action: Sign.Actions.FinishAddPDFToStoreAction) {
    switch (action.type) {
        case Sign.Actions.Types.FINISH_ADD_PDF_TO_STORE:
            return { ...state, [action.payload.id]: { document: action.payload.document, pages: action.payload.pages } };
        
        default:
            return state;
    }
}