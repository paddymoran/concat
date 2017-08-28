const DEFAULT_STATE: Sign.OverlayDefaults = {};

export default function overlayDefaults(state: Sign.OverlayDefaults = DEFAULT_STATE, action: any) {
    switch (action.type) {
        case Sign.Actions.Types.MOVE_SIGNATURE:
            return {...state, signature: {...state.signature, ...action.payload}}
        case Sign.Actions.Types.MOVE_DATE:
            return {...state, date: {...state.date, ...action.payload}};
        case Sign.Actions.Types.MOVE_TEXT:
            return {...state, text: {...state.text, ...action.payload}};
        case Sign.Actions.Types.MOVE_PROMPT:
            return {...state, prompt: {...state.prompt, ...action.payload}};
    }
    return state;
}