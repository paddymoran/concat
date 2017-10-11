const DEFAULT_STATE = {width: 0};

export default function documents(state: Sign.Dimensions = DEFAULT_STATE, action: any) {
    switch (action.type) {
        case Sign.Actions.Types.UPDATE_DOCUMENT_WIDTH:
            if(action.payload.width !== state.width){
                return { ...state, width: action.payload.width }
            }
            return state;

        default:
            return state;
    }
}
