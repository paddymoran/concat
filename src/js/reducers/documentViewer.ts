const DEFAULT_STATE: Sign.DocumentViewer = {
    signatures: [],
    signRequestStatus: Sign.DownloadStatus.NotStarted,
};

const SIGNATURE_DEFAULT_HEIGHT = 150;
const SIGNATURE_DEFAULT_WIDTH = SIGNATURE_DEFAULT_HEIGHT * 2;

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
        x: 0,
        y: SIGNATURE_DEFAULT_HEIGHT,
        width: SIGNATURE_DEFAULT_WIDTH,
        height: SIGNATURE_DEFAULT_HEIGHT
    };

    return { ...state, signatures: [ ...state.signatures, newSignature ] };
}

function moveSignature(state: Sign.DocumentViewer, action: Sign.Actions.MoveSignature): Sign.DocumentViewer {
    const { signatureIndex, ...rest } = action.payload;

    let signatures = [...state.signatures];
    signatures[signatureIndex] = {
        ...state.signatures[signatureIndex],
        ...rest
    };

    return { ...state, signatures };
}

function setSignRequestStatus(state: Sign.DocumentViewer, action: Sign.Actions.SetSignRequestStatus): Sign.DocumentViewer {
    return {
        ...state,
        signRequestStatus: action.payload.signRequestStatus
    };
}