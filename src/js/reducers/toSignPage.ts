const DEFAULT_STATE: Sign.ToSignPage = {
    showComplete: false
};

export default function(state: Sign.ToSignPage = DEFAULT_STATE, action: any) {
    switch (action.type) {
        case Sign.Actions.Types.TOGGLE_TO_SIGN_SHOW_COMPLETE:
            return {
                ...state,
                showComplete: !state.showComplete
            };

        default:
            return state;
    }
}