export function addPDFToStore(payload: Sign.Actions.AddPDFToStoreActionPayload): Sign.Actions.AddPDFToStoreAction {
    return { type: Sign.Actions.Types.ADD_PDF_TO_STORE, payload };
}

export function updatePDFPageToStore(payload: Sign.Actions.UpdatePDFPageToStoreActionPayload): Sign.Actions.UpdatePDFPageToStoreAction {
    return { type: Sign.Actions.Types.UPDATE_PDF_PAGE_TO_STORE, payload };
}

export function requestDocumentPage(payload: Sign.Actions.RequestDocumentPagePayload): Sign.Actions.RequestDocumentPageAction {
    return { type: Sign.Actions.Types.REQUEST_DOCUMENT_PAGE, payload };
}