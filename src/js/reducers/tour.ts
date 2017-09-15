const DEFAULT_STATE: Sign.Tour = {
    showing: false

};

export default function(state: Sign.Tour = DEFAULT_STATE, action: any): Sign.Tour {
    switch (action.type) {
        case Sign.Actions.Types.CHANGE_TOUR:
            return {...state, ...action.payload}
    }
    return state;
}