const DEFAULT_STATE: Sign.DocumentSetInviteTokens  = {

};

function updateInviteToken(state: Sign.InviteTokens, payload: Sign.Actions.UpdateInviteTokenPayload){
    return {...state, [payload.email]: payload}
}

export default function(state: Sign.DocumentSetInviteTokens = DEFAULT_STATE, action: any): Sign.DocumentSetInviteTokens {
    switch (action.type) {
        case Sign.Actions.Types.UPDATE_INVITE_TOKEN:
            return {...state, [action.payload.documentSetId]: updateInviteToken(state[action.payload.documentSetId], action.payload)}
    }
    return state;
}