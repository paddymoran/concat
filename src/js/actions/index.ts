export function addDocument(payload: {uuid: string, filename: string, file: File}) {
    return {
        type: Sign.Actions.Types.ADD_DOCUMENT,
        payload
    };
}

export function updateDocument(payload: string) {
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
