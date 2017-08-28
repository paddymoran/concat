const DEFAULT_STATE = {
    downloadStatus: Sign.DownloadStatus.NotStarted,
    documentSets: {}
};

export default function requestedSignatures(state: Sign.RequestedSignatures = DEFAULT_STATE, action: any): Sign.RequestedSignatures {
    let setId, documents, i;

    switch(action.type) {
        case Sign.Actions.Types.UPDATE_REQUESTED_SIGNATURES:
            {
                const { downloadStatus, documentSets} = action.payload;
                return {
                    ...state,
                    downloadStatus,
                    documentSets: {
                        ...state.documentSets,
                        ...documentSets.reduce((acc: any, documentSet: any) => {
                            acc[documentSet.documentSetId] = documentSet.documents.reduce((acc:any, document:any) => {
                                acc[document.documentId] = {prompts: document.prompts, signRequestId: document.signRequestId};
                                return acc;
                            }, {});
                            return acc;
                        }, {})
                    }
                };
            }
        default:
            return state;
    }
}

