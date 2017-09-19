const DEFAULT_STATE = {

};

export default function documentSets(state: Sign.DocumentSets = DEFAULT_STATE, action: any): Sign.DocumentSets {
    let setId, documents, i;

    switch(action.type) {
        case Sign.Actions.Types.RESET_DOCUMENTS:
            return DEFAULT_STATE;

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

                const documentIds = rest.documents ? rest.documents.map((d: any) => d.documentId) : state[documentSetId].documentIds;

                return {
                    ...state,
                    [documentSetId]: {
                        ...state[documentSetId],
                        documentIds,
                        ...rest,
                    }
                };
            }
        case Sign.Actions.Types.UPDATE_DOCUMENT_SETS:
        case Sign.Actions.Types.UPDATE_REQUESTED_SIGNATURES:
            {
                const { documentSets } = action.payload;
                return {
                    ...state,
                    ...documentSets.reduce((acc : any, set : any) => {
                        acc = {...acc};
                        acc[set.documentSetId] = {...acc[set.documentSetId], ...set, documentIds: set.documents.map((d: any) => d.documentId), downloadStatus: Sign.DownloadStatus.Complete}
                        return acc;
                    }, state)
                };
            }

        case Sign.Actions.Types.ADD_DOCUMENT:
            // dedupe
            const documentIds = [...state[action.payload.documentSetId].documentIds, action.payload.documentId];

            return {
                ...state,
                [action.payload.documentSetId]: {
                    ...state[action.payload.documentSetId],
                    documentIds,
                    isOwner: true
                }
            };

         case Sign.Actions.Types.REMOVE_DOCUMENT:
            const documentSetId = Object.keys(state).find(key => state[key].documentIds.includes(action.payload.documentId));
            i = state[documentSetId].documentIds.findIndex(doc => doc === action.payload.documentId);

            if (i > -1) {
                const list = [...state[documentSetId].documentIds];
                list.splice(i, 1);
                return {
                    ...state,
                    [documentSetId]: {
                        ...state[documentSetId],
                        documentIds: list
                    }
                };
            }
            return state;

        case Sign.Actions.Types.REORDER_DOCUMENTS:
            return reorderDocuments(state, action);

        case Sign.Actions.Types.DEFINE_RECIPIENTS:
            return {
                ...state,
                [action.payload.documentSetId]: { ...state[action.payload.documentSetId], recipients: action.payload.recipients }
            };

        default:
            return state;
    }
}

function reorderDocuments(state: Sign.DocumentSets, action: Sign.Actions.ReorderDocuments): Sign.DocumentSets {
    const { documentId, newIndex } = action.payload;

    // Find the document set with this document
    const documentSetId = Object.keys(state).find(key => state[key].documentIds.includes(documentId));

    // Make a copy of the documents ids - so we don't mutate the original
    let documentIds = [ ...state[documentSetId].documentIds ];

    // Remove the document we are moving from where it currently is
    const currentIndex = documentIds.findIndex(doc => doc === action.payload.documentId);
    documentIds.splice(currentIndex, 1);

    // Insert the document we removed, in the place it is meant to move to
    documentIds.splice(newIndex, 0, documentId);

    return {
        ...state,
        [documentSetId]: { ...state[documentSetId], documentIds }
    };
}