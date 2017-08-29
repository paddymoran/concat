const DEFAULT_STATE: Sign.UploadDocuments = {
    inviteSignatories: false
};

export default function(state: Sign.UploadDocuments = DEFAULT_STATE, action: any): Sign.UploadDocuments {
    switch (action.type) {
        case Sign.Actions.Types.SET_INVITE_SIGNATORIES:
            return { ...state, inviteSignatories: action.payload.inviteSignatories };

        default:
            return state;
    }
}