export function addPDF(payload: Sign.Actions.AddPDFToStoreActionPayload): Sign.Actions.AddPDFToStoreAction {
    return { type: Sign.Actions.Types.ADD_PDF_TO_STORE, payload };
}