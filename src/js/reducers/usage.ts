const DEFAULT_STATE: Sign.Usage  = {
    status: Sign.DownloadStatus.NotStarted,
};

export default function(state: Sign.Usage = DEFAULT_STATE, action: any): Sign.Usage {
    switch (action.type) {
        case Sign.Actions.Types.UPDATE_USAGE:
            return { ...state, ...action.payload};

        case Sign.Actions.Types.SUBMIT_SIGN_REQUESTS:
        case Sign.Actions.Types.SIGN_DOCUMENT:
            return {...state, status: Sign.DownloadStatus.Stale}

        default:
            return state;
    }
}