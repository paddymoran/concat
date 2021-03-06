export function resetState(payload?: Sign.Actions.ResetStatePayload): Sign.Actions.ResetState {
    return {
        type: Sign.Actions.Types.RESET_STATE,
        payload
    };
}
export function resetDocuments(payload?: Sign.Actions.ResetDocumentsPayload): Sign.Actions.ResetDocuments {
    return {
        type: Sign.Actions.Types.RESET_DOCUMENTS,
        payload
    };
}
export function viewDocument(payload: Sign.Actions.ViewDocumentPayload): Sign.Actions.ViewDocument {
    return {
        type: Sign.Actions.Types.VIEW_DOCUMENT,
        payload
    };
}

export function addDocument(payload: Sign.Actions.AddDocumentPayload): Sign.Actions.AddDocument {
    return {
        type: Sign.Actions.Types.ADD_DOCUMENT,
        payload
    };
}
export function requestDocument(documentId: string): Sign.Actions.RequestDocument {
    return {
        type: Sign.Actions.Types.REQUEST_DOCUMENT,
        payload: { documentId }
    }
}

export function downloadDocument(id: string) {
    return {
        type: Sign.Actions.Types.DOWNLOAD_DOCUMENT,
        payload: { id }
    }
}

export function updateDocument(payload: Sign.Actions.UpdateDocumentPayload): Sign.Actions.UpdateDocument {
    return {
        type: Sign.Actions.Types.UPDATE_DOCUMENT,
        payload
    };
}

export function submitDocuments(payload: string) {
    return {
        type: Sign.Actions.Types.SUBMIT_DOCUMENTS,
        payload
    };
}

export function removeDocument(documentId: string): Sign.Actions.RemoveDocument {
    return {
        type: Sign.Actions.Types.REMOVE_DOCUMENT,
        payload: { documentId }
    };
}

export function uploadSignature(payload: Sign.Actions.UploadSignaturePayload): Sign.Actions.UploadSignature {
    return {
        type: Sign.Actions.Types.UPLOAD_SIGNATURE,
        payload
    };
}

export function selectSignature(signatureId: number): Sign.Actions.SelectSignature {
    return {
        type: Sign.Actions.Types.SELECT_SIGNATURE,
        payload: { signatureId }
    };
}

export function selectInitial(payload: Sign.Actions.SelectInitialPayload): Sign.Actions.SelectInitial {
    return {
        type: Sign.Actions.Types.SELECT_INITIAL,
        payload
    };
}

export function addOverlays(payload: Sign.Actions.AddOverlaysPayload): Sign.Actions.AddOverlays {
    return {
        type: Sign.Actions.Types.ADD_OVERLAYS,
        payload
    };
}

export function addSignatureToDocument(payload: Sign.Actions.AddSignatureToDocumentPayload): Sign.Actions.AddSignatureToDocument {
    return {
        type: Sign.Actions.Types.ADD_SIGNATURE_TO_DOCUMENT,
        payload
    };
}

export function removeSignatureFromDocument(payload: Sign.Actions.RemoveSignatureFromDocumentPayload): Sign.Actions.RemoveSignatureFromDocument {
    return {
        type: Sign.Actions.Types.REMOVE_SIGNATURE_FROM_DOCUMENT,
        payload
    }
}

export function moveSignature(payload: Sign.Actions.MoveSignaturePayload): Sign.Actions.MoveSignature {
    return {
        type: Sign.Actions.Types.MOVE_SIGNATURE,
        payload
    };
}

export function addDateToDocument(payload: Sign.Actions.AddDateToDocumentPayload): Sign.Actions.AddDateToDocument {
    return {
        type: Sign.Actions.Types.ADD_DATE_TO_DOCUMENT,
        payload
    };
}

export function removeDateFromDocument(payload: Sign.Actions.RemoveDateFromDocumentPayload): Sign.Actions.RemoveDateFromDocument {
    return {
        type: Sign.Actions.Types.REMOVE_DATE_FROM_DOCUMENT,
        payload
    }
}

export function moveDate(payload: Sign.Actions.MoveDatePayload): Sign.Actions.MoveDate {
    return {
        type: Sign.Actions.Types.MOVE_DATE,
        payload
    };
}

export function addTextToDocument(payload: Sign.Actions.AddTextToDocumentPayload): Sign.Actions.AddTextToDocument {
    return {
        type: Sign.Actions.Types.ADD_TEXT_TO_DOCUMENT,
        payload
    };
}

export function removeTextFromDocument(payload: Sign.Actions.RemoveTextFromDocumentPayload): Sign.Actions.RemoveTextFromDocument {
    return {
        type: Sign.Actions.Types.REMOVE_TEXT_FROM_DOCUMENT,
        payload
    }
}

export function moveText(payload: Sign.Actions.MoveTextPayload): Sign.Actions.MoveText {
    return {
        type: Sign.Actions.Types.MOVE_TEXT,
        payload
    };
}

export function addPromptToDocument(payload: Sign.Actions.AddPromptToDocumentPayload): Sign.Actions.AddPromptToDocument {
    return {
        type: Sign.Actions.Types.ADD_PROMPT_TO_DOCUMENT,
        payload
    };
}

export function removePromptFromDocument(payload: Sign.Actions.RemovePromptFromDocumentPayload): Sign.Actions.RemovePromptFromDocument {
    return {
        type: Sign.Actions.Types.REMOVE_PROMPT_FROM_DOCUMENT,
        payload
    }
}

export function movePrompt(payload: Sign.Actions.MovePromptPayload): Sign.Actions.MovePrompt {
    return {
        type: Sign.Actions.Types.MOVE_PROMPT,
        payload
    };
}



export function showResults(payload: Sign.Actions.ShowResultsPayload): Sign.Actions.ShowResults {
    return {
        type: Sign.Actions.Types.SHOW_RESULTS,
        payload
    };
}

export function showSignatureSelection() {
    return {
        type: Sign.Actions.Types.SHOW_SIGNATURE_SELECTION
    };
}

export function showInitialSelectionModal(): Sign.Actions.ShowInitialSelectionModal {
    return {
        type: Sign.Actions.Types.SHOW_INITIAL_SELECTION_MODAL
    };
}

export function deleteSignature(signatureId: number): Sign.Actions.DeleteSignature {
    return {
        type: Sign.Actions.Types.DELETE_SIGNATURE,
        payload: { signatureId }
    };
}

export function updateDocumentSet(payload: Sign.Actions.DocumentSetPayload): Sign.Actions.UpdateDocumentSet {
    return {
        type: Sign.Actions.Types.UPDATE_DOCUMENT_SET,
        payload
    };
}

export function updateDocumentSets(payload: Sign.Actions.DocumentSetsPayload): Sign.Actions.UpdateDocumentSets {
    return {
        type: Sign.Actions.Types.UPDATE_DOCUMENT_SETS,
        payload
    };
}

export function createDocumentSet(payload: Sign.Actions.DocumentSetPayload): Sign.Actions.CreateDocumentSet {
    return {
        type: Sign.Actions.Types.CREATE_DOCUMENT_SET,
        payload
    };
}

export function requestDocumentSet(documentSetId: string): Sign.Actions.RequestDocumentSet {
    return {
        type: Sign.Actions.Types.REQUEST_DOCUMENT_SET,
        payload: { documentSetId }
    };
}

export function requestDocumentSets(): Sign.Actions.RequestDocumentSets {
    return {
        type: Sign.Actions.Types.REQUEST_DOCUMENT_SETS,
        payload: {  }
    };
}

export function requestRequestedSignatures(): Sign.Actions.RequestRequestedSignatures {
    return {
        type: Sign.Actions.Types.REQUEST_REQUESTED_SIGNATURES,
        payload: {  }
    };
}

export function updateRequestedSignatures(payload: Sign.Actions.UpdateRequestedSignaturesPayload): Sign.Actions.UpdateRequestedSignatures {
    return {
        type: Sign.Actions.Types.UPDATE_REQUESTED_SIGNATURES,
        payload
    };
}

export function signDocument(payload: Sign.Actions.SignDocumentPayload): Sign.Actions.SignDocument {
    return {
        type: Sign.Actions.Types.SIGN_DOCUMENT,
        payload
    };
}

export function setSignRequestStatus(signRequestStatus: Sign.DownloadStatus): Sign.Actions.SetSignRequestStatus {
    return {
        type: Sign.Actions.Types.SET_SIGN_REQUEST_STATUS,
        payload: { signRequestStatus }
    };
}

export function reorderDocuments(payload: Sign.Actions.ReorderDocumentsPayload): Sign.Actions.ReorderDocuments {
    return {
        type: Sign.Actions.Types.REORDER_DOCUMENTS,
        payload
    };
}

export function requestSignatures(): Sign.Actions.RequestSignatures {
    return {
        type: Sign.Actions.Types.REQUEST_SIGNATURES
    };
}

export function setSignatureIds(payload: Sign.Actions.SetSignatureIdsPayload): Sign.Actions.SetSignatureIds {
    return {
        type: Sign.Actions.Types.SET_SIGNATURE_IDS,
        payload
    };
}


export function setActivePage(payload: Sign.Actions.SetActivePagePayload): Sign.Actions.SetActivePage {
    return {
        type: Sign.Actions.Types.SET_ACTIVE_PAGE,
        payload
    };
}

export function closeModal(payload: Sign.Actions.CloseModalPayload): Sign.Actions.CloseModal {
    return {
        type: Sign.Actions.Types.CLOSE_SHOWING_MODAL,
        payload
    };
}

export function updateModalData(payload: Sign.Actions.UpdateModalDataPayload): Sign.Actions.UpdateModalData {
    return {
        type: Sign.Actions.Types.UPDATE_MODAL_DATA,
        payload
    };
}

export function showSignConfirmationModal(payload: Sign.Actions.ShowSignConfirmationModalPayload): Sign.Actions.ShowSignConfirmationModal {
    return {
        type: Sign.Actions.Types.SHOW_SIGN_CONFIRMATION_MODAL,
        payload
    };
}

export function showFailureModal(payload: Sign.Actions.ShowFailureModalPayload): Sign.Actions.ShowFailureModal {
    return {
        type: Sign.Actions.Types.SHOW_FAILURE_MODAL,
        payload
    };
}

export function showInviteModal(payload: Sign.Actions.ShowInviteModalPayload): Sign.Actions.ShowInviteModal {
    return {
        type: Sign.Actions.Types.SHOW_INVITE_MODAL,
        payload
    };
}

export function showSessionEndedModal(payload: Sign.Actions.ShowSessionEndedModalPayload): Sign.Actions.ShowSessionEndedModal {
    return {
        type: Sign.Actions.Types.SHOW_SESSION_ENDED_MODAL,
        payload
    };
}



export function updateDocumentWidth(payload: Sign.Actions.UpdateDocumentWidthPayload) : Sign.Actions.UpdateDocumentWidth {
    return {
        type: Sign.Actions.Types.UPDATE_DOCUMENT_WIDTH,
        payload
    }
}


export function defineRecipients(payload: Sign.Actions.DefineRecipientsPayload) : Sign.Actions.DefineRecipients {
    return {
        type: Sign.Actions.Types.DEFINE_RECIPIENTS,
        payload
    }
}


export function submitDocumentSet(payload: Sign.Actions.SubmitDocumentSetPayload) : Sign.Actions.SubmitDocumentSet {
    return {
        type: Sign.Actions.Types.SUBMIT_DOCUMENT_SET,
        payload
    }
}

export function setActiveSignControl(payload: Sign.Actions.SetActiveSignControlPayload) : Sign.Actions.SetActiveSignControl {
    return {
        type: Sign.Actions.Types.SET_ACTIVE_SIGN_CONTROL,
        payload
    };
}

export function setInviteSignatories(payload: Sign.Actions.SetInviteSignatoriesPayload): Sign.Actions.SetInviteSignatories {
    return {
        type: Sign.Actions.Types.SET_INVITE_SIGNATORIES,
        payload
    };
}


export function saveDocumentView(payload: Sign.Actions.SaveDocumentViewPayload): Sign.Actions.SaveDocumentView {
    return {
        type: Sign.Actions.Types.SAVE_DOCUMENT_VIEW,
        payload
    };
}

export function updateSaveStatus(payload: Sign.Actions.UpdateSaveStatusPayload): Sign.Actions.UpdateSaveStatus {
    return {
        type: Sign.Actions.Types.UPDATE_SAVE_STATUS,
        payload
    }
}

export function showEmailDocumentsModal(payload: Sign.Actions.ShowEmailDocumentsModalPayload): Sign.Actions.ShowEmailDocumentsModal {
    return {
        type: Sign.Actions.Types.SHOW_EMAIL_DOCUMENT_MODAL,
        payload
    }
}

export function showDownloadAllModal(payload: Sign.Actions.ShowDownloadAllModalPayload): Sign.Actions.ShowDownloadAllModal {
    return {
        type: Sign.Actions.Types.SHOW_DOWNLOAD_ALL_MODAL,
        payload
    }
}

export function showInviteTokensModal(payload: Sign.Actions.ShowInviteTokensModalPayload): Sign.Actions.ShowInviteTokensModal {
    return {
        type: Sign.Actions.Types.SHOW_INVITE_TOKENS_MODAL,
        payload
    }
}

export function emailDocuments(payload: Sign.Actions.EmailDocumentsPayload): Sign.Actions.EmailDocuments {
    return {
        type: Sign.Actions.Types.EMAIL_DOCUMENT,
        payload
    };
}

export function rejectDocument(payload: Sign.Actions.RejectDocumentPayload): Sign.Actions.RejectDocument {
    return {
        type: Sign.Actions.Types.REJECT_DOCUMENT,
        payload
    };
}

export function toggleToSignShowComplete(): Sign.Actions.ToggleToSignShowComplete {
    return {
        type: Sign.Actions.Types.TOGGLE_TO_SIGN_SHOW_COMPLETE
    };
}

export function setSaveStatus(payload: Sign.Actions.SetSaveStatusPayload): Sign.Actions.SetSaveStatus {
    return {
        type: Sign.Actions.Types.SET_SAVE_STATUS,
        payload
    };
}
/**
 * Contacts
 */
export function requestContacts(): Sign.Actions.RequestContacts {
    return {
        type: Sign.Actions.Types.REQUEST_CONTACTS
    };
}

export function updateContacts(payload: Sign.Actions.UpdateContactsPayload): Sign.Actions.UpdateContacts {
    return {
        type: Sign.Actions.Types.SET_CONTACTS,
        payload
    };
}


export function requestUsage(): Sign.Actions.RequestUsage {
    return {
        type: Sign.Actions.Types.REQUEST_USAGE
    }
}

export function updateUsage(payload: Sign.Actions.UpdateUsagePayload): Sign.Actions.UpdateUsage {
    return {
        type: Sign.Actions.Types.UPDATE_USAGE,
        payload
    }
}

export function showActivateControlModal(payload: Sign.Actions.ShowActivateControlModalPayload): Sign.Actions.ShowActivateControlModal {
    return {
        type: Sign.Actions.Types.SHOW_ACTIVATE_CONTROL_MODAL,
        payload
    };
}

export function markDocumentAsComplete(payload: Sign.Actions.MarkDocumentAsCompletePayload): Sign.Actions.MarkDocumentAsComplete {
    return {
        type: Sign.Actions.Types.MARK_DOCUMENT_AS_COMPLETE,
        payload
    };
}

export function finishedSigningDocument(payload: Sign.Actions.FinishedSigningDocumentPayload): Sign.Actions.FinishedSigningDocument {
    return {
        type: Sign.Actions.Types.FINISHED_SIGNING_DOCUMENT,
        payload
    };
}

export function confirmAction<T>(payload: Sign.Actions.ConfirmActionPayload<T>): Sign.Actions.ConfirmAction<T> {
    return {
        type: Sign.Actions.Types.CONFIRM_ACTION,
        payload
    };
}

export function revokeSignInvitation(payload: Sign.Actions.RevokeSignInvitationPayload): Sign.Actions.ConfirmAction<Sign.Actions.RevokeSignInvitation> {
    return confirmAction<Sign.Actions.RevokeSignInvitation>({
        title: 'Revoke Sign Invitation',
        message: 'Are you sure you want to revoke this sign invitation?',
        submitText: 'Revoke Invitation',
        action: {
            type: Sign.Actions.Types.REVOKE_SIGN_INVITATION,
            payload
        }
    });
}

export function deleteDocument(payload: Sign.Actions.DeleteDocumentPayload): Sign.Actions.ConfirmAction<Sign.Actions.DeleteDocument> {
    return confirmAction<Sign.Actions.DeleteDocument>({
        title: 'Delete Document',
        message: 'Are you sure you want to this document?',
        submitText: 'Delete Document',
        action: {
            type: Sign.Actions.Types.DELETE_DOCUMENT,
            payload
        }
    });
}

export function deleteDocumentSet(payload: Sign.Actions.DeleteDocumentSetPayload): Sign.Actions.ConfirmAction<Sign.Actions.DeleteDocumentSet> {
    return confirmAction<Sign.Actions.DeleteDocumentSet>({
        title: 'Delete Document Set',
        message: 'Are you sure you want to this document set?',
        submitText: 'Delete Document Set',
        action: {
            type: Sign.Actions.Types.DELETE_DOCUMENT_SET,
            payload
        }
    });
}

export function requestVerification(payload: Sign.Actions.RequestVerificationPayload): Sign.Actions.RequestVerification {
    return {
        type: Sign.Actions.Types.REQUEST_VERIFICATION,
        payload
    };
}

export function updateVerification(payload: Sign.Actions.UpdateVerificationPayload): Sign.Actions.UpdateVerification {
    return {
        type: Sign.Actions.Types.UPDATE_VERIFICATION,
        payload
    };
}

export function showSigningCompleteModal(payload: Sign.Actions.ShowSigningCompleteModalPayload): Sign.Actions.ShowSigningCompleteModal {
    return {
        type: Sign.Actions.Types.SHOW_SIGNING_COMPLETE_MODAL,
        payload
    };
}

export function finishSigning(payload: Sign.Actions.FinishSigningPayload): Sign.Actions.FinishSigning {
    return {
        type: Sign.Actions.Types.FINISH_SIGNING,
        payload
    };
}

export function changeTour(payload: Sign.Actions.ChangeTourPayload): Sign.Actions.ChangeTour {
    return {
        type: Sign.Actions.Types.CHANGE_TOUR,
        payload
    };
}

export function updateUserMeta(payload: Sign.Actions.UpdateUserMetaDataPayload) : Sign.Actions.UpdateUserMetaData {
    return {
        type: Sign.Actions.Types.UPDATE_USER_META,
        payload
    }
}

export function defineDocumentOrder(payload: Sign.Actions.DefineDocumentOrderPayload) : Sign.Actions.DefineDocumentOrder{
    return {
        type: Sign.Actions.Types.DEFINE_DOCUMENT_ORDER,
        payload
    }
}

export function startSelfSigningSession(payload: Sign.Actions.StartSelfSigningSessionPayload) : Sign.Actions.StartSelfSigningSession {
    return {
        type: Sign.Actions.Types.START_SELF_SIGNING_SESSION,
        payload
    }
}

export function startSigningSession(payload: Sign.Actions.StartSigningSessionPayload) : Sign.Actions.StartSigningSession {
    return {
        type: Sign.Actions.Types.START_SIGNING_SESSION,
        payload
    }
}

export function endSigningSession(payload: Sign.Actions.EndSigningSessionPayload) : Sign.Actions.EndSigningSession {
    return {
        type: Sign.Actions.Types.END_SIGNING_SESSION,
        payload
    }
}

export function requestInviteToken(payload: Sign.Actions.RequestInviteTokenPayload) : Sign.Actions.RequestInviteToken {
    return {
        type: Sign.Actions.Types.REQUEST_INVITE_TOKEN,
        payload
    }
}

export function updateInviteToken(payload: Sign.Actions.UpdateInviteTokenPayload) : Sign.Actions.UpdateInviteToken {
    return {
        type: Sign.Actions.Types.UPDATE_INVITE_TOKEN,
        payload
    }
}
