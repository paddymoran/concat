const DEFAULT_STATE = {width: 0};

export default function documents(state: Sign.Dimensions = DEFAULT_STATE, action: any) {
    switch (action.type) {
        case Sign.Actions.Types.UPDATE_DOCUMENT_WIDTH:
            return { ...state, width: action.payload.width }

        default:
            return state;
    }
}
