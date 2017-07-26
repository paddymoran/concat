const actionCreator = <T>(type: string): Sign.Actions.IActionCreator<T> => Object.assign((payload: T):any => ({type, payload}), {type})

export const isType = <T>(action: Sign.Action<any>, actionCreator: Sign.Actions.IActionCreator<T>):
  action is Sign.Action<T> => action.type === actionCreator.type

export const addDocument = actionCreator<{uuid: string, filename: string, file: File}>(Sign.Actions.Types.ADD_DOCUMENT);
export const updateDocument = actionCreator<string>(Sign.Actions.Types.UPDATE_DOCUMENT);
export const submitDocuments = actionCreator<string>(Sign.Actions.Types.SUBMIT_DOCUMENTS);
export const removeDocument = actionCreator<string>(Sign.Actions.Types.REMOVE_DOCUMENT);
export const updateForm = actionCreator<string>(Sign.Actions.Types.UPDATE_FORM);
export const setDocumentSetId = actionCreator<string>(Sign.Actions.Types.SET_DOCUMENT_SET_ID);