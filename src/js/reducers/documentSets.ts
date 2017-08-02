const DEFAULT_STATE = {};

export default function documentSets(state: Sign.DocumentSets = DEFAULT_STATE, action: Sign.DocumentAction) {
    let setId, documents, i;
    switch(action.type) {
        case Sign.Actions.Types.CREATE_DOCUMENT_SET:
            {
                const { documentSetId, ...rest } = action.payload;

                const newDocumentSet = {
                    ...rest,
                    documentIds: [],
                    downloadStatus: Sign.DownloadStatus.NotStarted
                };

                return {
                    ...state,
                    [action.payload.documentSetId]: newDocumentSet
                };
            }

        case Sign.Actions.Types.UPDATE_DOCUMENT_SET:
            {
                const { documentSetId, ...rest } = action.payload;

                return {
                    ...state,
                    [documentSetId]: { ...state[documentSetId], ...rest }
                };
            }


        case Sign.Actions.Types.ADD_DOCUMENT:
            // dedupe
            const documentIds = [...state[action.payload.documentSetId].documentIds, action.payload.documentId];

            return {
                ...state,
                [action.payload.documentSetId]: { ...state[action.payload.documentSetId], documentIds }
            };

         case Sign.Actions.Types.REMOVE_DOCUMENT:
            const documentSetId = Object.keys(state).find(key => state[key].documentIds.includes(action.payload.documentId))
            i = state[documentSetId].documentIds.findIndex(doc => doc === action.payload.documentId);

            if (i > -1) {
                return {
                    ...state,
                    [documentSetId]: {
                        ...state[documentSetId],
                        documents: state[documentSetId].documentIds.splice(i, 1)
                    }
                };
            }
            return state;
    }
    return state;
}