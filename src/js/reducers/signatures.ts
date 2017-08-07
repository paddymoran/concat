const DEFAULT_STATE = {
    status: Sign.DownloadStatus.NotStarted
};

export default function signatures(state: Sign.Signatures = DEFAULT_STATE, action: any) {
    switch (action.type) {
        case Sign.Actions.Types.REQUEST_SIGNATURES:
            return requestSignatures(state, action);

        case Sign.Actions.Types.SET_SIGNATURE_IDS:
            return setSignatureIds(state, action);

        default:
            return state;
    }
}

function requestSignatures(state: Sign.Signatures, action: Sign.Actions.RequestSignatures): Sign.Signatures {
    return {
        ...state,
        status: Sign.DownloadStatus.InProgress
    };
}

function setSignatureIds(state: Sign.Signatures, action: Sign.Actions.SetSignatureIds): Sign.Signatures {
    return {
        ...state,
        status: Sign.DownloadStatus.Complete,
        signatureIds: action.payload.signatureIds
    };
}