const DEFAULT_STATE: Sign.UserMetaData  = {tour: {}};

export default function(state: Sign.UserMetaData = DEFAULT_STATE, action: any): Sign.UserMetaData {
    switch(action.type){
       case Sign.Actions.Types.UPDATE_USER_META:
           return {...state, ...action.payload};
       case Sign.Actions.Types.CHANGE_TOUR:
           if(action.payload.showing){
               // trigger start tour will redo things i think
                return {...state, tour: {...state.tour, tourDismissed: false, tourViewed: []}};
           }
           return state;
        }
    return state;
}