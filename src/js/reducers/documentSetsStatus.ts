const DEFAULT_STATE = Sign.DownloadStatus.NotStarted

export default function documentSetsStatus(state: Sign.DocumentSetsStatus = DEFAULT_STATE, action: any): Sign.DocumentSetsStatus {
    switch(action.type) {
        case Sign.Actions.Types.RESET_DOCUMENTS:
            return DEFAULT_STATE;
        case Sign.Actions.Types.UPDATE_DOCUMENT_SETS:
            return action.payload.downloadStatus
     }
     return state;
}