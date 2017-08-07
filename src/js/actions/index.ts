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

export function moveSignature(payload: Sign.Actions.MoveSignaturePayload): Sign.Actions.MoveSignature {
    return {
        type: Sign.Actions.Types.MOVE_SIGNATURE,
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

export function showSignatureSelection() {
    return { type: Sign.Actions.Types.SHOW_SIGNATURE_SELECTION };
}

export function hideSignatureSelection() {
    return { type: Sign.Actions.Types.HIDE_SIGNATURE_SELECTION };
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