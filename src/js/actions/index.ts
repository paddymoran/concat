export function addDocument(id: string, filename: string, file: File): Sign.Actions.AddDocument {
    return {
        type: Sign.Actions.Types.ADD_DOCUMENT,
        payload: { id, filename, file }
    };
}
export function requestDocument(id: string) {
    return {
        type: Sign.Actions.Types.REQUEST_DOCUMENT,
        payload: { id }
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

export function removeDocument(id: string) {
    return {
        type: Sign.Actions.Types.REMOVE_DOCUMENT,
        payload: id
    };
}

export function updateForm(payload: string) {
    return {
        type: Sign.Actions.Types.UPDATE_FORM,
        payload
    };
}

export function setDocumentSetId(id: string) {
    return {
        type: Sign.Actions.Types.SET_DOCUMENT_SET_ID,
        payload: id
    };

}

export function uploadSignature(payload: string) {
    return {
        type: Sign.Actions.Types.UPLOAD_SIGNATURE,
        payload
    };
}

export function selectSignature(id: number) {
    return {
        type: Sign.Actions.Types.SELECT_SIGNATURE,
        id
    };
}


export function showSignatureSelection() {
    return {
        type: Sign.Actions.Types.SHOW_SIGNATURE_SELECTION
    };
}

export function hideSignatureSelection() {
    return {
        type: Sign.Actions.Types.HIDE_SIGNATURE_SELECTION
    };
}

export function deleteSignature(id: number) {
    return {
        type: Sign.Actions.Types.DELETE_SIGNATURE,
        payload: id
    };
}

