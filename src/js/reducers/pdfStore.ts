const DEFAULT_STATE: Sign.PDFStore = {};

export default function pdfStoreReducer(state=DEFAULT_STATE, action: any) {
    switch (action.type) {
        case Sign.Actions.Types.FINISH_ADD_PDF_TO_STORE:
            const statuses = Array(action.payload.document.numPages).fill(Sign.DocumentReadStatus.NotStarted);
            return { ...state, [action.payload.id]: { document: action.payload.document, pages: [], pageStatuses: statuses } };
        case Sign.Actions.Types.UPDATE_PDF_PAGE_TO_STORE:
            const pages = [...(state[action.payload.id].pages)];
            pages[action.payload.index] = action.payload.page;
            const pageStatuses = [...(state[action.payload.id].pageStatuses)];
            pageStatuses[action.payload.index] = action.payload.pageStatus;
            return { ...state, [action.payload.id]: { ...state[action.payload.id], pages, pageStatuses } };

        default:
            return state;
    }
}