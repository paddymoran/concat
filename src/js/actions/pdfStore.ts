export function getPage(docId: string, pageNumber: number): Sign.Actions.IGetPageFromPDFStoreAction {
    return {
        type: Sign.Actions.Types.GET_PAGE_FROM_PDF_STORE,
        payload: { docId, pageNumber }
    };
}