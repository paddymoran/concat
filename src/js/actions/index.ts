export function addDocument(payload: Sign.Actions.AddDocumentPayload): Sign.Actions.AddDocument {
    return {
        type: Sign.Actions.Types.ADD_DOCUMENT,
        payload
    };
}
export function requestDocument(documentId: string): Sign.Actions.RequestDocument {
    return {
        type: Sign.Actions.Types.REQUEST_DOCUMENT,
        payload: { documentId }
    }
}

export function downloadDocument(id: string) {
    return {
        type: Sign.Actions.Types.DOWNLOAD_DOCUMENT,
        payload: { id }
    }
}

export function updateDocument(payload: Sign.Actions.UpdateDocumentPayload): Sign.Actions.UpdateDocument {
    return {
        type: Sign.Actions.Types.UPDATE_DOCUMENT,
        payload
    };
}

export function submitDocuments(payload: string) {
    return {
        type: Sign.Actions.Types.SUBMIT_DOCUMENTS,
        payload
    };
}

export function removeDocument(documentId: string): Sign.Actions.RemoveDocument {
    return {
        type: Sign.Actions.Types.REMOVE_DOCUMENT,
        payload: { documentId }
    };
}

export function uploadSignature(payload: Sign.Actions.UploadSignaturePayload): Sign.Actions.UploadSignature {
    return {
        type: Sign.Actions.Types.UPLOAD_SIGNATURE,
        payload
    };
}

export function selectSignature(signatureId: number): Sign.Actions.SelectSignature {
    return {
        type: Sign.Actions.Types.SELECT_SIGNATURE,
        payload: { signatureId }
    };
}

export function selectInitial(payload: Sign.Actions.SelectInitialPayload): Sign.Actions.SelectInitial {
    return {
        type: Sign.Actions.Types.SELECT_INITIAL,
        payload
    };
}


export function addSignatureToDocument(payload: Sign.Actions.AddSignatureToDocumentPayload): Sign.Actions.AddSignatureToDocument {
    return {
        type: Sign.Actions.Types.ADD_SIGNATURE_TO_DOCUMENT,
        payload
    };
}

export function removeSignatureFromDocument(payload: Sign.Actions.RemoveSignatureFromDocumentPayload): Sign.Actions.RemoveSignatureFromDocument {
    return {
        type: Sign.Actions.Types.REMOVE_SIGNATURE_FROM_DOCUMENT,
        payload
    }
}

export function moveSignature(payload: Sign.Actions.MoveSignaturePayload): Sign.Actions.MoveSignature {
    return {
        type: Sign.Actions.Types.MOVE_SIGNATURE,
        payload
    };
}

export function addDateToDocument(payload: Sign.Actions.AddDateToDocumentPayload): Sign.Actions.AddDateToDocument {
    return {
        type: Sign.Actions.Types.ADD_DATE_TO_DOCUMENT,
        payload
    };
}

export function removeDateFromDocument(payload: Sign.Actions.RemoveDateFromDocumentPayload): Sign.Actions.RemoveDateFromDocument {
    return {
        type: Sign.Actions.Types.REMOVE_DATE_FROM_DOCUMENT,
        payload
    }
}

export function moveDate(payload: Sign.Actions.MoveSignaturePayload): Sign.Actions.MoveDate {
    return {
        type: Sign.Actions.Types.MOVE_DATE,
        payload
    };
}

export function showResults(payload: Sign.Actions.ShowResultsPayload): Sign.Actions.ShowResults {
    return {
        type: Sign.Actions.Types.SHOW_RESULTS,
        payload
    };
}

export function showSignatureSelection() {
    return {
        type: Sign.Actions.Types.SHOW_SIGNATURE_SELECTION
    };
}

export function showInitialSelectionModal(): Sign.Actions.ShowInitialSelectionModal {
    return {
        type: Sign.Actions.Types.SHOW_INITIAL_SELECTION_MODAL
    };
}

export function deleteSignature(signatureId: number): Sign.Actions.DeleteSignature {
    return {
        type: Sign.Actions.Types.DELETE_SIGNATURE,
        payload: { signatureId }
    };
}

export function updateDocumentSet(payload: Sign.Actions.DocumentSetPayload): Sign.Actions.UpdateDocumentSet {
    return {
        type: Sign.Actions.Types.UPDATE_DOCUMENT_SET,
        payload
    };
}

export function createDocumentSet(payload: Sign.Actions.DocumentSetPayload): Sign.Actions.CreateDocumentSet {
    return {
        type: Sign.Actions.Types.CREATE_DOCUMENT_SET,
        payload
    };
}

export function requestDocumentSet(documentSetId: string): Sign.Actions.RequestDocumentSet {
    return {
        type: Sign.Actions.Types.REQUEST_DOCUMENT_SET,
        payload: { documentSetId }
    };
}

export function signDocument(payload: Sign.Actions.SignDocumentPayload): Sign.Actions.SignDocument {
    return {
        type: Sign.Actions.Types.SIGN_DOCUMENT,
        payload
    };
}

export function setSignRequestStatus(signRequestStatus: Sign.DownloadStatus): Sign.Actions.SetSignRequestStatus {
    return {
        type: Sign.Actions.Types.SET_SIGN_REQUEST_STATUS,
        payload: { signRequestStatus }
    };
}

export function reorderDocuments(payload: Sign.Actions.ReorderDocumentsPayload): Sign.Actions.ReorderDocuments {
    return {
        type: Sign.Actions.Types.REORDER_DOCUMENTS,
        payload
    };
}

export function requestSignatures(): Sign.Actions.RequestSignatures {
    return {
        type: Sign.Actions.Types.REQUEST_SIGNATURES
    };
}

export function setSignatureIds(payload: Sign.Actions.SetSignatureIdsPayload): Sign.Actions.SetSignatureIds {
    return {
        type: Sign.Actions.Types.SET_SIGNATURE_IDS,
        payload
    };
}


export function setActivePage(payload: Sign.Actions.SetActivePagePayload): Sign.Actions.SetActivePage {
    return {
        type: Sign.Actions.Types.SET_ACTIVE_PAGE,
        payload
    };
}

export function closeModal(payload: Sign.Actions.CloseModalPayload): Sign.Actions.CloseModal {
    return {
        type: Sign.Actions.Types.CLOSE_SHOWING_MODAL,
        payload
    };
}

export function showSignConfirmationModal(payload: Sign.Actions.ShowSignConfirmationModalPayload): Sign.Actions.ShowSignConfirmationModal {
    return {
        type: Sign.Actions.Types.SHOW_SIGN_CONFIRMATION_MODAL,
        payload
    };
}

export function updateDocumentWidth(payload: Sign.Actions.UpdateDocumentWidthPayload) : Sign.Actions.UpdateDocumentWidth {
    return {
        type: Sign.Actions.Types.UPDATE_DOCUMENT_WIDTH,
        payload
    }
}