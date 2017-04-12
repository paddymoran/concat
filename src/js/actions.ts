interface ActionCreator<T> {
  type: string
  (payload: T): Sign.Action<T>
}

const actionCreator = <T>(type: string): ActionCreator<T> => Object.assign((payload: T):any => ({type, payload}), {type})

export const isType = <T>(action: Sign.Action<any>, actionCreator: ActionCreator<T>):
  action is Sign.Action<T> => action.type === actionCreator.type

export const addDocuments = actionCreator<{filename: string, file: File}[]>('ADD_DOCUMENTS');
export const updateDocument = actionCreator<string>('UPDATE_DOCUMENT');
export const submitDocuments = actionCreator<string>('SUBMIT_DOCUMENTS');
export const removeDocument = actionCreator<{ id: number }>('REMOVE_DOCUMENT');
export const updateForm = actionCreator<string>('UPDATE_FORM');


