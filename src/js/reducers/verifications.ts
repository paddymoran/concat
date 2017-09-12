const DEFAULT_STATE: Sign.Verifications  = {
};

export default function(state: Sign.Verifications = DEFAULT_STATE, action: any): Sign.Verifications {
    switch (action.type) {
        case Sign.Actions.Types.UPDATE_VERIFICATION:
            return {...state, [action.payload.hash]: {...state[action.payload.hash], ...action.payload}};
        default:
            return state;
    }
}