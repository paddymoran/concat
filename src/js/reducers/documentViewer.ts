const DEFAULT_STATE: Sign.DocumentViewer = {
    signatures: {},
    dates: {},
    texts: {},
    prompts: {},
    signRequestStatus: Sign.DownloadStatus.NotStarted,
    documents: {},
};

export default function documentViewer(state: Sign.DocumentViewer = DEFAULT_STATE, action: any): Sign.DocumentViewer {
    switch (action.type) {
        case Sign.Actions.Types.SELECT_SIGNATURE:
            return selectSignature(state, action);

        case Sign.Actions.Types.SELECT_INITIAL:
            return selectInitial(state, action);

        case Sign.Actions.Types.ADD_SIGNATURE_TO_DOCUMENT:
            return addSignatureToDocument(state, action);

        case Sign.Actions.Types.MOVE_SIGNATURE:
            return moveSignature(state, action);

        case Sign.Actions.Types.REMOVE_SIGNATURE_FROM_DOCUMENT:
            return removeSignatureFromDocument(state, action);

        case Sign.Actions.Types.ADD_DATE_TO_DOCUMENT:
            return {...state, dates: addDateToDocument(state.dates, action)};

        case Sign.Actions.Types.MOVE_DATE:
            return {...state, dates: moveDate(state.dates, action)};

        case Sign.Actions.Types.REMOVE_DATE_FROM_DOCUMENT:
            return {...state, dates: removeDateFromDocument(state.dates, action)};

        case Sign.Actions.Types.ADD_TEXT_TO_DOCUMENT:
            return {...state, texts: addTextToDocument(state.texts, action)};

        case Sign.Actions.Types.MOVE_TEXT:
            return {...state, texts: moveText(state.texts, action)};

        case Sign.Actions.Types.REMOVE_TEXT_FROM_DOCUMENT:
            return {...state, texts: removeTextFromDocument(state.texts, action)};

        case Sign.Actions.Types.ADD_PROMPT_TO_DOCUMENT:
            return {...state, prompts: addPromptToDocument(state.prompts, action)};

        case Sign.Actions.Types.MOVE_PROMPT:
            return {...state, prompts: movePrompt(state.prompts, action)};

        case Sign.Actions.Types.REMOVE_PROMPT_FROM_DOCUMENT:
            return {...state, prompts: removePromptFromDocument(state.prompts, action)};

        case Sign.Actions.Types.SET_SIGN_REQUEST_STATUS:
            return setSignRequestStatus(state, action);

        case Sign.Actions.Types.SET_ACTIVE_PAGE:
            return setActivePage(state, action);

        default:
            return state;
    }
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

function addSignatureToDocument(state: Sign.DocumentViewer, action: Sign.Actions.AddSignatureToDocument): Sign.DocumentViewer {
    return {
        ...state,
        signatures: {
            ...state.signatures,
            [action.payload.signatureIndex]: action.payload
        }
    };
}

function moveSignature(state: Sign.DocumentViewer, action: Sign.Actions.MoveSignature): Sign.DocumentViewer {
    const { signatureIndex, ...rest } = action.payload;

    return {
        ...state,
        signatures: {
            ...state.signatures,
            [signatureIndex]: { ...state.signatures[signatureIndex], ...rest }
        }
    };
}

function removeSignatureFromDocument(state: Sign.DocumentViewer, action: Sign.Actions.RemoveSignatureFromDocument): Sign.DocumentViewer {
    const signatures = { ...state.signatures };
    delete signatures[action.payload.signatureIndex];
    return { ...state, signatures };
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