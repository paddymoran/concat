const DEFAULT_STATE: Sign.DocumentViewer = {
    signatures: {},
    dates: {},
    texts: {},
    prompts: {},
    activeSignControl: Sign.SignControl.NONE,
    signRequestStatus: Sign.DownloadStatus.NotStarted,
    documents: {},
    saveStatus: Sign.DownloadStatus.NotStarted
};

export default function documentViewer(state: Sign.DocumentViewer = DEFAULT_STATE, action: any): Sign.DocumentViewer {
    switch (action.type) {
        case Sign.Actions.Types.RESET_DOCUMENTS:
            return DEFAULT_STATE;

        case Sign.Actions.Types.SELECT_SIGNATURE:
            return selectSignature(state, action);

        case Sign.Actions.Types.SELECT_INITIAL:
            return selectInitial(state, action);

        case Sign.Actions.Types.ADD_SIGNATURE_TO_DOCUMENT:
            return {...state, signatures: addSignatureToDocument(state.signatures, action), saveStatus: Sign.DownloadStatus.Stale};

        case Sign.Actions.Types.MOVE_SIGNATURE:
            return {...state, signatures: moveSignature(state.signatures, action), saveStatus: Sign.DownloadStatus.Stale};

        case Sign.Actions.Types.REMOVE_SIGNATURE_FROM_DOCUMENT:
            return {...state, signatures: removeSignatureFromDocument(state.signatures, action), saveStatus: Sign.DownloadStatus.Stale};

        case Sign.Actions.Types.ADD_DATE_TO_DOCUMENT:
            return {...state, dates: addDateToDocument(state.dates, action), saveStatus: Sign.DownloadStatus.Stale};

        case Sign.Actions.Types.MOVE_DATE:
            return {...state, dates: moveDate(state.dates, action), saveStatus: Sign.DownloadStatus.Stale};

        case Sign.Actions.Types.REMOVE_DATE_FROM_DOCUMENT:
            return {...state, dates: removeDateFromDocument(state.dates, action), saveStatus: Sign.DownloadStatus.Stale};

        case Sign.Actions.Types.ADD_TEXT_TO_DOCUMENT:
            return {...state, texts: addTextToDocument(state.texts, action), saveStatus: Sign.DownloadStatus.Stale};

        case Sign.Actions.Types.MOVE_TEXT:
            return {...state, texts: moveText(state.texts, action), saveStatus: Sign.DownloadStatus.Stale};

        case Sign.Actions.Types.REMOVE_TEXT_FROM_DOCUMENT:
            return {...state, texts: removeTextFromDocument(state.texts, action), saveStatus: Sign.DownloadStatus.Stale};

        case Sign.Actions.Types.ADD_PROMPT_TO_DOCUMENT:
            return {...state, prompts: addPromptToDocument(state.prompts, action), saveStatus: Sign.DownloadStatus.Stale};

        case Sign.Actions.Types.MOVE_PROMPT:
            return {...state, prompts: movePrompt(state.prompts, action), saveStatus: Sign.DownloadStatus.Stale};

        case Sign.Actions.Types.REMOVE_PROMPT_FROM_DOCUMENT:
            return {...state, prompts: removePromptFromDocument(state.prompts, action), saveStatus: Sign.DownloadStatus.Stale};


        case Sign.Actions.Types.ADD_OVERLAYS:
            return {
                ...state,
                dates: action.payload.dates.reduce((acc : Sign.DocumentDates, action: Sign.Actions.AddDateToDocumentPayload) =>
                                                   addDateToDocument(acc, {payload: action, type: Sign.Actions.Types.ADD_DATE_TO_DOCUMENT } ), state.dates),
                prompts: action.payload.prompts.reduce((acc : Sign.DocumentPrompts, action: Sign.Actions.AddPromptToDocumentPayload) =>
                                                       addPromptToDocument(acc, {payload: action, type: Sign.Actions.Types.ADD_PROMPT_TO_DOCUMENT }), state.prompts),
                texts: action.payload.texts.reduce((acc : Sign.DocumentTexts, action: Sign.Actions.AddTextToDocumentPayload) =>
                                                       addTextToDocument(acc, {payload: action, type: Sign.Actions.Types.ADD_TEXT_TO_DOCUMENT }), state.texts),
                signatures: action.payload.signatures.reduce((acc : Sign.DocumentSignatures, action: Sign.Actions.AddSignatureToDocumentPayload) =>
                                                       addSignatureToDocument(acc, {payload: action, type: Sign.Actions.Types.ADD_SIGNATURE_TO_DOCUMENT }), state.signatures),
            };

        case Sign.Actions.Types.SET_SIGN_REQUEST_STATUS:
            return setSignRequestStatus(state, action);

        case Sign.Actions.Types.SET_ACTIVE_PAGE:
            return setActivePage(state, action);

        case Sign.Actions.Types.SET_ACTIVE_SIGN_CONTROL:
            return setActiveSignButton(state, action);

        case Sign.Actions.Types.DEFINE_RECIPIENTS:
            return {...state, prompts: removeMissingRecipients(state.prompts, action), saveStatus: Sign.DownloadStatus.Stale}

        case Sign.Actions.Types.SET_SAVE_STATUS:
            if((action.payload.status === Sign.DownloadStatus.Complete || action.payload.status === Sign.DownloadStatus.Failed) &&
               state.saveStatus === Sign.DownloadStatus.InProgress){
                return {...state, saveStatus: action.payload.status}
            }
            if(action.payload.status === Sign.DownloadStatus.InProgress){
                return {...state, saveStatus: Sign.DownloadStatus.InProgress}
            }

        case Sign.Actions.Types.MARK_DOCUMENT_AS_COMPLETE:
            return completeDocument(state, action);

        case Sign.Actions.Types.REJECT_DOCUMENT:
            return rejectDocument(state, action);

        default:
            return state;
    }
}

function rejectDocument(state: Sign.DocumentViewer, action: Sign.Actions.RejectDocument): Sign.DocumentViewer {
    const updateData: Partial<Sign.DocumentView> = {
        signStatus: Sign.SignStatus.REJECTED,
        rejectReason: action.payload.reason
    };

    return updateDocument(state, action.payload.documentId, updateData);
}

function completeDocument(state: Sign.DocumentViewer, action: Sign.Actions.MarkDocumentAsComplete): Sign.DocumentViewer {
    const updateData: Partial<Sign.DocumentView> = {
        signStatus: Sign.SignStatus.SIGNED,
        completed: action.payload.complete,
        rejectReason: undefined
    };

    return updateDocument(state, action.payload.documentId, updateData);
}

function updateDocument(state: Sign.DocumentViewer, documentId: string, updateData: Partial<Sign.DocumentView>): Sign.DocumentViewer {
    return {
        ...state,
        documents: {
            ...state.documents,
            [documentId]: {
                ...state.documents[documentId],
                ...updateData
            }
        }
    };
}

function setActiveSignButton(state: Sign.DocumentViewer, action: Sign.Actions.SetActiveSignControl): Sign.DocumentViewer {
    const currentActive = state.activeSignControl;
    const newActive = action.payload.activeSignControl;
    return {
        ...state,
        activeSignControl: newActive === currentActive ? Sign.SignControl.NONE : newActive
    };
}

function selectSignature(state: Sign.DocumentViewer, action: Sign.Actions.SelectSignature): Sign.DocumentViewer {
    return { ...state, selectedSignatureId: action.payload.signatureId };
}

function selectInitial(state: Sign.DocumentViewer, action: Sign.Actions.SelectInitial): Sign.DocumentViewer {
    return {
        ...state,
        selectedInitialId: action.payload.initialId
    };
}

function addSignatureToDocument(state: Sign.DocumentSignatures, action: Sign.Actions.AddSignatureToDocument): Sign.DocumentSignatures {
    return {
        ...state,
        [action.payload.signatureIndex]: action.payload
    };
}

function moveSignature(state: Sign.DocumentSignatures, action: Sign.Actions.MoveSignature): Sign.DocumentSignatures {
    const { signatureIndex, ...rest } = action.payload;

    return {
        ...state,
        [signatureIndex]: { ...state[signatureIndex], ...rest }
    };
}

function removeSignatureFromDocument(state: Sign.DocumentSignatures, action: Sign.Actions.RemoveSignatureFromDocument): Sign.DocumentSignatures {
    state = { ...state};
    delete state[action.payload.signatureIndex];
    return state;
}

function addDateToDocument(state: Sign.DocumentDates, action: Sign.Actions.AddDateToDocument): Sign.DocumentDates {
    return {
        ...state,
        [action.payload.dateIndex]: action.payload
    };
}

function moveDate(state: Sign.DocumentDates, action: Sign.Actions.MoveDate): Sign.DocumentDates {
    const { dateIndex, ...rest } = action.payload;

    return {
            ...state,
            [dateIndex]: { ...state[dateIndex], ...rest }
    };
}

function removeDateFromDocument(state: Sign.DocumentDates, action: Sign.Actions.RemoveDateFromDocument): Sign.DocumentDates {
    state = {...state};
    delete state[action.payload.dateIndex];
    return state;
}



function addTextToDocument(state: Sign.DocumentTexts, action: Sign.Actions.AddTextToDocument): Sign.DocumentTexts {
    return {
        ...state,
        [action.payload.textIndex]: action.payload
    };
}

function moveText(state: Sign.DocumentTexts, action: Sign.Actions.MoveText): Sign.DocumentTexts {
    const { textIndex, ...rest } = action.payload;

    return {
            ...state,
            [textIndex]: { ...state[textIndex], ...rest }
    };
}

function removeTextFromDocument(state: Sign.DocumentTexts, action: Sign.Actions.RemoveTextFromDocument): Sign.DocumentTexts {
    state = {...state};
    delete state[action.payload.textIndex];
    return state;
}


function addPromptToDocument(state: Sign.DocumentPrompts, action: Sign.Actions.AddPromptToDocument): Sign.DocumentPrompts {
    return {
        ...state,
        [action.payload.promptIndex]: action.payload
    };
}

function movePrompt(state: Sign.DocumentPrompts, action: Sign.Actions.MovePrompt): Sign.DocumentPrompts {
    const { promptIndex, ...rest } = action.payload;

    return {
            ...state,
            [promptIndex]: { ...state[promptIndex], ...rest }
    };
}

function removePromptFromDocument(state: Sign.DocumentPrompts, action: Sign.Actions.RemovePromptFromDocument): Sign.DocumentPrompts {
    state = {...state};
    delete state[action.payload.promptIndex];
    return state;
}




function setSignRequestStatus(state: Sign.DocumentViewer, action: Sign.Actions.SetSignRequestStatus): Sign.DocumentViewer {
    return {
        ...state,
        signRequestStatus: action.payload.signRequestStatus
    };
}

function setActivePage(state: Sign.DocumentViewer, action: Sign.Actions.SetActivePage): Sign.DocumentViewer {
    return { ...state, documents: {...state.documents, [action.payload.documentId]: {...(state.documents || {})[action.payload.documentId], activePage: action.payload.pageNumber} } };
}

function removeMissingRecipients(state: Sign.DocumentPrompts, action: Sign.Actions.DefineRecipients): Sign.DocumentPrompts {
    const recipients = action.payload.recipients.reduce((acc: any, recipient: Sign.Recipient) => {
        acc[recipient.email] = true;
        return acc
    }, {});
    Object.keys(state).map((key: string) => {
        if(!recipients[state[key].value.recipientEmail]){
            state = {
                ...state,
                [key]: {
                    ...state[key],
                    value: {
                        type: state[key].value.type,
                        recipientEmail: ''
                    }
                }
            }
        }
    })
    return state;
}