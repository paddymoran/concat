const DEFAULT_STATE: Sign.DocumentViewer = {
    signatures: {},
    signRequestStatus: Sign.DownloadStatus.NotStarted,
    documents: {}
};

export default function documentViewer(state: Sign.DocumentViewer = DEFAULT_STATE, action: any): Sign.DocumentViewer {
    switch (action.type) {
        case Sign.Actions.Types.SELECT_SIGNATURE:
            return selectSignature(state, action);

        case Sign.Actions.Types.ADD_SIGNATURE_TO_DOCUMENT:
            return addSignatureToDocument(state, action);

        case Sign.Actions.Types.MOVE_SIGNATURE:
            return moveSignature(state, action);

        case Sign.Actions.Types.SET_SIGN_REQUEST_STATUS:
            return setSignRequestStatus(state, action);

        case Sign.Actions.Types.REMOVE_SIGNATURE_FROM_DOCUMENT:
            return removeSignatureFromDocument(state, action);

        case Sign.Actions.Types.SET_ACTIVE_PAGE:
            return setActivePage(state, action);
        default:
            return state;
    }
}

function selectSignature(state: Sign.DocumentViewer, action: Sign.Actions.SelectSignature): Sign.DocumentViewer {
    return { ...state, selectedSignatureId: action.payload.signatureId };
}

function addSignatureToDocument(state: Sign.DocumentViewer, action: Sign.Actions.AddSignatureToDocument): Sign.DocumentViewer {
    const newSignature: Sign.DocumentSignature = {
        signatureId: action.payload.signatureId,
        pageNumber: action.payload.pageNumber,
        xRatio: action.payload.xOffset || 0,
        yRatio: action.payload.yOffset || 0
    };

    return {
        ...state,
        signatures: { ...state.signatures, [action.payload.signatureIndex]: newSignature }
    };
}

function moveSignature(state: Sign.DocumentViewer, action: Sign.Actions.MoveSignature): Sign.DocumentViewer {
    const { signatureIndex, ...rest } = action.payload;

    return {
        ...state,
        signatures: {
            ...state.signatures,
            [signatureIndex]: { ...state.signatures[signatureIndex], ...rest }
        }
    };
}

function setSignRequestStatus(state: Sign.DocumentViewer, action: Sign.Actions.SetSignRequestStatus): Sign.DocumentViewer {
    return {
        ...state,
        signRequestStatus: action.payload.signRequestStatus
    };
}

function removeSignatureFromDocument(state: Sign.DocumentViewer, action: Sign.Actions.RemoveSignatureFromDocument): Sign.DocumentViewer {
    const signatures = { ...state.signatures };
    delete signatures[action.payload.signatureIndex];

    return { ...state, signatures };
}

function setActivePage(state: Sign.DocumentViewer, action: Sign.Actions.SetActivePage): Sign.DocumentViewer {
    return { ...state, documents: {...state.documents, [action.payload.documentId]: {...(state.documents || {})[action.payload.documentId], activePage: action.payload.pageNumber} } };
}