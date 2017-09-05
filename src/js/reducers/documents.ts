const DEFAULT_STATE = {};

export default function documents(state: Sign.Documents = DEFAULT_STATE, action: any) {
    switch (action.type) {
        case Sign.Actions.Types.ADD_DOCUMENT:
            const { documentSetId, documentId, ...rest } = action.payload;
            const newDoc = {
                ...rest,
                uploadStatus: Sign.DocumentUploadStatus.NotStarted,
                readStatus: rest.file ? Sign.DocumentReadStatus.InProgress : Sign.DocumentReadStatus.NotStarted
            };

            return { ...state, [documentId]: newDoc };

        case Sign.Actions.Types.UPDATE_DOCUMENT:
            {
                const { documentSetId, documentId, ...rest } = action.payload;
                return { ...state, [documentId]: { ...state[documentId], ...rest } };
            }

        case Sign.Actions.Types.REQUEST_DOCUMENT:
            {
                const  { documentSetId, documentId, ...rest } = action.payload;
                const requestDoc = {
                    ...rest,
                    uploadStatus: Sign.DocumentUploadStatus.Complete,
                    readStatus: Sign.DocumentReadStatus.NotStarted
                };
                return { ...state, [documentId]: { ...state[documentId], ...requestDoc } };
            }

        case Sign.Actions.Types.REMOVE_DOCUMENT:
            return { ...state, [action.payload.documentId]: undefined };

        case Sign.Actions.Types.UPDATE_DOCUMENT_SETS:
        case Sign.Actions.Types.UPDATE_REQUESTED_SIGNATURES:
            {
                const { documentSets } = action.payload;
                return {
                    ...state,
                    ...documentSets.reduce((acc : any, set : any) => {
                        acc = {...acc, ...set.documents.reduce((acc: any, doc: any) => {
                            acc = {...acc};
                            acc[doc.documentId] = doc;
                            if(acc[doc.documentId].readStatus === undefined){
                                acc[doc.documentId] = {...acc[doc.documentId], readStatus: Sign.DocumentReadStatus.NotStarted}
                            }
                            return acc;
                         }, acc)}
                        return acc;
                    }, state)
                };
            }

        default:
            return state;
    }
}