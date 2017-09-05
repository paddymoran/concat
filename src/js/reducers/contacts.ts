const DEFAULT_STATE: Sign.Contacts = {
    status: Sign.DownloadStatus.NotStarted,
    contacts: null
};

export default function(state: Sign.Contacts = DEFAULT_STATE, action: any): Sign.Contacts {
    switch (action.type) {
        case Sign.Actions.Types.SET_CONTACTS:
            return { ...state, ...action.payload};

        case Sign.Actions.Types.SUBMIT_DOCUMENT_SET:
            return {...state, status: Sign.DownloadStatus.Stale}

        default:
            return state;
    }
}