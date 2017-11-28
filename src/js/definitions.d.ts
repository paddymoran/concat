
declare let DEV : boolean;


interface Window {
     _CSRF_TOKEN: string;
}



declare namespace Sign {
    interface Viewport {
        width: number,
        height: number,
    }

    const enum DocumentUploadStatus {
        NotStarted,
        InProgress,
        Complete,
        Failed
    }

    const enum DocumentReadStatus {
        NotStarted,
        InProgress,
        Complete,
        Failed
    }

    interface DocumentData {
        filename: string;
        createdAt?: string;
    }

    const enum SignStatus {
        'PENDING' = 'Pending',
        'SIGNED' = 'Signed',
        'REJECTED' = 'Rejected',
        'PARTIAL' = 'Partial',
    }

    const enum DocumentStatus {
        'PENDING' = 'Pending',
        'COMPLETE' = 'Complete'
    }

    interface SignatureRequestInfo {
        userId: number,
        name: string,
        email: string,
        status: string,
        rejectedMessage: string;
        acceptedMessage: string;
        signRequestId: number;
    }

    type SignatureRequestInfos = SignatureRequestInfo[];


    interface Document extends DocumentData{
        id: string;
        file: File;
        data: ArrayBuffer;
        uploadStatus: DocumentUploadStatus;
        downloadProgress: number;
        readStatus: DocumentReadStatus;
        progress?: number;
        pageCount?: number;
        pageViewports?: Viewport[];
        signRequestId: number;
        signStatus?:  DocumentStatus;
        requestStatus?:  SignStatus;
        signatureRequestInfos?: SignatureRequestInfos,
        size?: number;
        acceptedMessage?: string;
        rejectedMessage?: string;
    }



    const enum DownloadStatus {
        NotStarted,
        InProgress,
        Complete,
        Failed,
        Stale
    }


    interface User {
        name: string;
        user_id: number;
        email?: string;
    }

    interface Verified {
        filename: string;
        signees: User[];
    }


    interface TourMetaData {
        tourViewed?: string[];
        tourDismissed?: boolean;
    }

    interface UserMetaData {
        tour: TourMetaData;
    }

    interface CurrentUser {
        name?: string;
        userId?: number;
        email?: string;
        emailVerified?: boolean;
        subscribed?: boolean;
    }



    type DocumentSetSignStatus = 'Pending' | 'Complete' | 'Rejected' | 'Partial';

    interface DocumentSet {
        documentIds: string[];
        downloadStatus: DownloadStatus;
        title?: string;
        recipients?: Recipients;
        createdAt?: string;
        owner?: User,
        isOwner?: boolean;
        size?: number;
    }

    interface DocumentSets {
        [documentSetId: string]: DocumentSet;
    }

    type DocumentSetsStatus = DownloadStatus;
    type SaveStatus = DownloadStatus;

    interface Documents {
        [documentId: string]: Document;
    }

    interface Modals {
        showing?: string;
        [key: string]: any;
    }

    interface Dimensions {
        width: number;
    }

    interface Positionable {
        documentId: string;
        pageNumber: number;
        offsetX: number;
        offsetY: number;
        ratioX?: number;
        ratioY?: number;
    }

    interface DocumentSignature extends Positionable{
        signatureId: number;
        xyRatio: number;
        sourceRequestPromptIndex?: string;
    }

    interface DocumentDate  extends Positionable{
        value: string;
        timestamp: number;
        format?: string;
        height: number;
        sourceRequestPromptIndex?: string;
    }

    interface DocumentText  extends Positionable{
        value: string;
        height: number;
        sourceRequestPromptIndex?: string;
    }

    type PromptType = 'signature' | 'initial' | 'date' | 'text';

    interface PromptInfo{
        recipientEmail: string;
        type: PromptType
    }

    interface DocumentPrompt extends Positionable{
        value: PromptInfo
        promptIndex: string;
    }

    interface DocumentSignatures {
        [key: string]: DocumentSignature;
    }

    interface DocumentDates {
        [key: string]: DocumentDate
    }

    interface DocumentTexts {
        [key: string]: DocumentText
    }

    interface DocumentPrompts {
        [key: string]: DocumentPrompt
    }

    const enum SignControl {
        NONE,
        SIGNATURE,
        INITIAL,
        DATE,
        TEXT,
        PROMPT,
    }

    interface DocumentView {
        activePage: number;
        completed: boolean;
        signStatus: Sign.SignStatus;
        rejectReason?: string;
        acceptedMessage?: string;
    }

    interface DocumentViews {
        [documentId: string]: DocumentView;
    }

    interface DocumentViewer {
        signRequestStatus: DownloadStatus;
        selectedSignatureId?: number;
        selectedInitialId?: number;
        signatures: DocumentSignatures;
        dates: DocumentDates;
        texts: DocumentTexts;
        prompts: DocumentPrompts;
        activeSignControl: SignControl;
        saveStatus: DownloadStatus;
        documents?: DocumentViews;
    }

    interface PDFStore {
        [id: string]: {
            document: PDFDocumentProxy;
            pages: PDFPageProxy[];
            pageStatuses: DocumentReadStatus[];
        }
    }

    interface Verifications {
        [hash: string]: {
            verified: Verified[];
            status: Sign.DownloadStatus
        }
    }

    interface Signatures {
        status: DownloadStatus;
        signatureIds?: number[];
        initialIds?: number[];
    }

    interface RequestedSignatureDocumentInfo{
        prompts: DocumentPrompt[];
        signRequestId: number;
    }


    interface RequestedSignatures {
        documentSets: {
            [documentSetId: string]: {
                [documentId: string]: RequestedSignatureDocumentInfo
            }
        }
        downloadStatus: DownloadStatus;
    }

    interface UploadDocuments {
        inviteSignatories: boolean;
    }

    interface OverlayDefaults {
        signature?: DocumentSignature;
        date?: DocumentDate;
        text?: DocumentText;
        prompt?: DocumentPrompt;
    }

    interface Contact {
        id: number;
        name: string;
        email: string;
    }

    type ContactList = Contact[];

    interface Contacts {
        status: DownloadStatus;
        contacts: ContactList;
    }

    interface Usage {
        amountPerUnit?: number;
        maxAllowanceReached?: boolean;
        requestedThisUnit?: number;
        signedThisUnit?: number;
        unit?: string;
        status: DownloadStatus;
    }

    interface Tour {
        showing: boolean;
    }

    interface InviteTokens {
        [email: string]: {
            url: string;
            status: DownloadStatus;
        }
    }

    interface DocumentSetInviteTokens {
        [documentSetId: string]: InviteTokens;
    }

    interface State {
        routing: any;
        documentSets: DocumentSets;
        documentSetsStatus: DocumentSetsStatus;
        documents: Documents;
        pdfStore: PDFStore;
        documentViewer: DocumentViewer;
        modals: Modals;
        signatures: Signatures;
        dimensions: Dimensions;
        requestedSignatures: RequestedSignatures;
        uploadDocuments: UploadDocuments;
        overlayDefaults: OverlayDefaults;
        toSignPage: ToSignPage;
        contacts: Contacts;
        usage: Usage;
        verifications: Verifications;
        user: CurrentUser;
        userMeta: UserMetaData;
        tour: Tour,
        inviteTokens: DocumentSetInviteTokens
    }

    interface ToSignPage {
        showComplete: boolean;
    }

    interface Action<T> {
        type: string;
        payload: T;
        shouldCall: (state: State) => boolean;
    }

    interface DocumentAction extends Action<any> {}

    interface DocumentHandler {
        onDrop(files: any): void;
    }

    interface CanvasReusePrevention {
        _count: number
    }

    interface FileDropZoneProps {
        connectDropTarget: Function;
        onDrop: Function;
        canDrop: Function;
        isOver: boolean
    }

    interface FormError {
        _error: string;
    }

    interface Recipient {
        name?: string;
        email?: string;
    }

    type Recipients = Recipient[];

    const enum DragAndDropTypes {
        ADD_SIGNATURE_TO_DOCUMENT = 'ADD_SIGNATURE_TO_DOCUMENT',
        ADD_DATE_TO_DOCUMENT = 'ADD_DATE_TO_DOCUMENT',
        ADD_TEXT_TO_DOCUMENT = 'ADD_TEXT_TO_DOCUMENT',
        ADD_PROMPT_TO_DOCUMENT = 'ADD_PROMPT_TO_DOCUMENT'
    }

    const enum DefaultSignatureSize {
        WIDTH = 200,
        HEIGHT = 100,
        WIDTH_RATIO = 0.2,
        TEXT_WIDTH_RATIO = 0.025,
        MIN_WIDTH = 65,
        MIN_HEIGHT = 20,
        MIN_XY_RATIO = 0.3,
        MAX_XY_RATIO = 5
    }

    const DEFAULT_DATE_FORMAT = 'DD MMMM YYYY';


    // These types match the database enum: signature_type
    const enum SignatureType {
        SIGNATURE = 'signature',
        INITIAL = 'initial',
        DATE = 'date',
        TEXT = 'text',
    }

    const enum FormName {
        RECIPIENTS = 'recipients',
        REJECT = 'reject',
        SIGN_MESSAGE = 'signMessage',
        RECIPIENT_MESSAGE = 'recipientMessage'
    }

    const enum ModalType {
        SIGN_CONFIRMATION = 'SIGN_CONFIRMATION',
        FAILURE = 'FAILURE',
        INVITE = 'INVITE',
        EMAIL_DOCUMENT = 'EMAIL_DOCUMENT',
        ACTIVATE_CONTROL = 'ACTIVATE_CONTROL',
        CONFIRM_ACTION = 'CONFIRM_ACTION',
        SIGNING_COMPLETE = 'SIGNING_COMPLETE',
        DOWNLOAD_ALL = 'DOWNLOAD_ALL',
        INVITE_TOKENS = 'INVITE_TOKENS',
        SESSION_ENDED = 'SESSION_ENDED'
    }

    interface SignatureRequest {
        recipient: Recipient;
        prompts?: DocumentPrompt[],
        documentIds?: string[];
        message?: string;
    }

    interface ExportTarget {
        url: string;
        name: string;
    }
}



declare namespace Sign.Components {

    interface PDFPreviewProps {
        documentId: string;
        pageViewports: Sign.Viewport[];
        pageCount: number;
        width: number;
    }
    interface SizedPDFPreviewProps extends PDFPreviewProps {
        size: {
            width: number;
        };
    }

    interface RouteDocumentSet {
        params: { documentSetId: string; };
    }

}

declare namespace Sign.Actions {
    const enum Types {
        VIEW_DOCUMENT = 'VIEW_DOCUMENT',
        ADD_DOCUMENT = 'ADD_DOCUMENT',
        REQUEST_DOCUMENT = 'REQUEST_DOCUMENT',
        REQUEST_DOCUMENT_PAGE = 'REQUEST_DOCUMENT_PAGE',
        DOWNLOAD_DOCUMENT = 'DOWNLOAD_DOCUMENT',
        UPDATE_DOCUMENT = 'UPDATE_DOCUMENT',
        SUBMIT_DOCUMENTS = 'SUBMIT_DOCUMENTS',
        REMOVE_DOCUMENT = 'REMOVE_DOCUMENT',
        REORDER_DOCUMENTS = 'REORDER_DOCUMENTS',
        UPDATE_FORM = 'UPDATE_FORM',

        ADD_PDF_TO_STORE = 'ADD_PDF_TO_STORE',
        FINISH_ADD_PDF_TO_STORE = 'FINISH_ADD_PDF_TO_STORE',
        UPDATE_PDF_PAGE_TO_STORE = 'UPDATE_PDF_PAGE_TO_STORE',
        UPLOAD_SIGNATURE = 'UPLOAD_SIGNATURE',
        SHOW_SIGNATURE_SELECTION = 'SHOW_SIGNATURE_SELECTION',
        SHOW_INITIAL_SELECTION_MODAL = 'SHOW_INITIAL_SELECTION_MODAL',
        DELETE_SIGNATURE = 'DELETE_SIGNATURE',

        SELECT_SIGNATURE = 'SELECT_SIGNATURE',
        SELECT_INITIAL = 'SELECT_INITITAL',
        ADD_SIGNATURE_TO_DOCUMENT = 'ADD_SIGNATURE_TO_DOCUMENT',
        ADD_DATE_TO_DOCUMENT = 'ADD_DATE_TO_DOCUMENT',
        ADD_TEXT_TO_DOCUMENT = 'ADD_TEXT_TO_DOCUMENT',
        ADD_PROMPT_TO_DOCUMENT = 'ADD_PROMPT_TO_DOCUMENT',
        ADD_OVERLAYS = 'ADD_OVERLAYS',
        MOVE_SIGNATURE = 'MOVE_SIGNATURE',
        MOVE_DATE = 'MOVE_DATE',
        MOVE_TEXT = 'MOVE_TEXT',
        MOVE_PROMPT = 'MOVE_PROMPT',
        REMOVE_SIGNATURE_FROM_DOCUMENT = 'REMOVE_SIGNATURE_FROM_DOCUMENT',
        REMOVE_DATE_FROM_DOCUMENT = 'REMOVE_DATE_FROM_DOCUMENT',
        REMOVE_TEXT_FROM_DOCUMENT = 'REMOVE_TEXT_FROM_DOCUMENT',
        REMOVE_PROMPT_FROM_DOCUMENT = 'REMOVE_PROMPT_FROM_DOCUMENT',
        SET_ACTIVE_SIGN_CONTROL = 'SET_ACTIVE_SIGN_CONTROL',

        SIGN_DOCUMENT = "SIGN_DOCUMENT",
        REJECT_DOCUMENT = 'REJECT_DOCUMENT',
        SET_SIGN_REQUEST_STATUS = "SET_SIGN_REQUEST_STATUS",
        MARK_DOCUMENT_AS_COMPLETE = 'MARK_DOCUMENT_AS_COMPLETE',
        FINISHED_SIGNING_DOCUMENT = 'FINISHED_SIGNING_DOCUMENT',

        REQUEST_DOCUMENT_SET = 'REQUEST_DOCUMENT_SET',
        REQUEST_DOCUMENT_SETS = 'REQUEST_DOCUMENT_SETS',
        CREATE_DOCUMENT_SET = 'CREATE_DOCUMENT_SET',
        UPDATE_DOCUMENT_SET = 'UPDATE_DOCUMENT_SET',
        UPDATE_DOCUMENT_SETS = 'UPDATE_DOCUMENT_SETS',

        REQUEST_REQUESTED_SIGNATURES = 'REQUEST_REQUESTED_SIGNATURES',
        UPDATE_REQUESTED_SIGNATURES = 'UPDATE_REQUESTED_SIGNATURES',

        REQUEST_SIGNATURES = 'REQUEST_SIGNATURES',
        SET_SIGNATURES_REQUEST_STATUS = 'SET_SIGNATURES_REQUEST_STATUS',
        SET_SIGNATURE_IDS = 'SET_SIGNATURE_IDS',

        SET_UPLOAD_DOCUMENTS_DOCUMENT_SET_ID = 'SET_UPLOAD_DOCUMENTS_DOCUMENT_SET_ID',
        GENERATE_UPLOAD_DOCUMENTS_DOCUMENT_SET_ID = 'GENERATE_UPLOAD_DOCUMENTS_DOCUMENT_SET_ID',
        SET_ACTIVE_PAGE = 'SET_ACTIVE_PAGE',

        // Modals
        SHOW_RESULTS = 'SHOW_RESULTS',
        SHOW_DOWNLOAD_ALL_MODAL = 'SHOW_DOWNLOAD_ALL_MODAL',
        SHOW_INVITE_TOKENS_MODAL = 'SHOW_INVITE_TOKENS_MODAL',
        FINISH_SIGNING = 'FINISH_SIGNING',

        CLOSE_SHOWING_MODAL = 'CLOSE_SHOWING_MODAL',
        UPDATE_MODAL_DATA = 'UPDATE_MODAL_DATA',
        SHOW_SIGN_CONFIRMATION_MODAL = 'SHOW_SIGN_CONFIRMATION_MODAL',
        SHOW_FAILURE_MODAL = 'SHOW_FAILURE_MODAL',
        SHOW_INVITE_MODAL = 'SHOW_INVITE_MODAL',
        SHOW_EMAIL_DOCUMENT_MODAL = 'SHOW_EMAIL_DOCUMENT_MODAL',
        SHOW_ACTIVATE_CONTROL_MODAL = 'SHOW_ACTIVATE_CONTROL_MODAL',
        SHOW_SIGNING_COMPLETE_MODAL = 'SHOW_SIGNING_COMPLETE_MODAL',
        SHOW_SESSION_ENDED_MODAL = 'SHOW_SESSION_ENDED_MODAL',


        UPDATE_DOCUMENT_WIDTH = 'UPDATE_DOCUMENT_WIDTH',

        DEFINE_RECIPIENTS = 'DEFINE_RECIPIENTS',

        SUBMIT_DOCUMENT_SET = 'SUBMIT_DOCUMENT_SET',

        SET_INVITE_SIGNATORIES = 'SET_INVITE_SIGNATORIES',

        SAVE_DOCUMENT_VIEW = 'SAVE_DOCUMENT_VIEW',
        UPDATE_SAVE_STATUS = 'UPDATE_SAVE_STATUS',

        CONFIRM_ACTION = 'CONFIRM_ACTION',

        EMAIL_DOCUMENT = 'EMAIL_DOCUMENT',

        DELETE_DOCUMENT = 'DELETE_DOCUMENT',
        DELETE_DOCUMENT_SET = 'DELETE_DOCUMENT_SET',

        // To sign page
        TOGGLE_TO_SIGN_SHOW_COMPLETE = 'TOGGLE_TO_SIGN_SHOW_COMPLETE',

        // Contacts
        REQUEST_CONTACTS = 'REQUEST_CONTACTS',
        SET_CONTACTS = 'SET_CONTACTS',
        SET_SAVE_STATUS = 'SET_SAVE_STATUS',

        REQUEST_USAGE = 'REQUEST_USAGE',
        UPDATE_USAGE = 'UPDATE_USAGE',

        RESET_STATE = 'RESET_STATE',

        RESET_DOCUMENTS = 'RESET_DOCUMENTS',

        REVOKE_SIGN_INVITATION = 'REVOKE_SIGN_INVITATION',

        REQUEST_VERIFICATION = 'REQUEST_VERIFICATION',
        UPDATE_VERIFICATION = 'UPDATE_VERIFICATION',

        CHANGE_TOUR = 'CHANGE_TOUR',

        UPDATE_USER_META = 'UPDATE_USER_META',

        DEFINE_DOCUMENT_ORDER = 'DEFINE_DOCUMENT_ORDER',

        START_SELF_SIGNING_SESSION = 'START_SELF_SIGNING_SESSION',

        START_SIGNING_SESSION = 'START_SIGNING_SESSION',

        END_SIGNING_SESSION = 'END_SIGNING_SESSION',

        REQUEST_INVITE_TOKEN = 'REQUEST_INVITE_TOKEN',
        UPDATE_INVITE_TOKEN = 'UPDATE_INVITE_TOKEN'

    }


    interface ActionCreator<T> {
        type: Sign.Actions.Types;
        payload: T;
    }

    interface Action {
        type: Sign.Actions.Types;
    }

    interface ResetStatePayload {
        type: Sign.Actions.Types.RESET_STATE
    }

    interface ResetDocumentsPayload {
        type: Sign.Actions.Types.RESET_DOCUMENTS
    }

    interface ViewDocumentPayload {
        documentSetId: string;
        documentId: string;
    }

    interface AddDocumentPayload {
        documentSetId: string;
        documentId: string;
        filename: string;
        file: File;
    }

    interface RequestDocumentPayload {
        documentId: string;
    }

    interface RemoveDocumentPayload {
        documentId: string;
    }

    interface UpdateDocumentPayload {
        documentId: string;
        readStatus?: Sign.DocumentReadStatus;
        uploadStatus?: Sign.DocumentUploadStatus;
        data?: ArrayBuffer;
        pageCount?: number,
        filename?: string;
        progress?: number;
        pageViewports?: Sign.Viewport[];
        downloadProgress?: number;
    }

    interface FinishAddPDFToStoreActionPayload {
        id: string;
        document: PDFDocumentProxy;
        pages: PDFPageProxy[];
        pageStatuses: DocumentReadStatus[];
    }

    interface AddPDFToStoreActionPayload {
        id: string;
        data: ArrayBuffer;
    }

    interface UpdatePDFPageToStoreActionPayload {
        id: string;
        index: number;
        page?: PDFPageProxy;
        pageStatus: DocumentReadStatus;
    }

    interface RequestDocumentPagePayload {
        id: string;
        index: number;
    }

    interface RequestDocumentSetPayload {
        documentSetId: string;
    }

    interface RequestDocumentSetsPayload {
    }

    interface DocumentSetPayload {
        documentSetId: string;
        title?: string;
        createdAt?: string;
        isOwner?: boolean;
        documents?: Sign.Document[],
        downloadStatus?: Sign.DownloadStatus;
        size?: number;
    }

    interface DocumentSetsPayload {
        documentSets: DocumentSetPayload[]
        downloadStatus: Sign.DownloadStatus;
    }

    interface RequestDocumentSetPayload {
        documentSetId: string;
    }

    interface RequestRequestedSignaturesPayload {}

    interface UpdateRequestedSignaturesPayload {
        downloadStatus: Sign.DownloadStatus;
        documentSets: DocumentSetPayload[]
    }

    interface UploadSignaturePayload {
        data: string;
        type: SignatureType;
    }

    interface DeleteSignaturePayload {
       signatureId: number
    }

    interface SelectSignaturePayload {
        signatureId: number;
    }

    interface SelectInitialPayload {
        initialId: number;
    }



    interface Positionable {
        documentId: string;
        pageNumber: number;
        offsetX: number;
        offsetY: number;
        ratioX: number;
        ratioY: number;
    }

    interface AddSignatureToDocumentPayload extends Positionable{
        signatureIndex: string;
        signatureId: number;
        xyRatio: number;
        sourceRequestPromptIndex?: string;
    }

    interface AddDateToDocumentPayload extends Positionable{
        dateIndex: string;
        value: string;
        timestamp: number;
        format: string;
        sourceRequestPromptIndex?: string;
        height: number;
    }

    interface AddTextToDocumentPayload extends Positionable{
        textIndex: string;
        value: string;
        height: number;
        sourceRequestPromptIndex?: string;
    }

    interface AddPromptToDocumentPayload extends Positionable{
        promptIndex: string;
        value: any;
    }

    interface AddOverlaysPayload {
        signatures: AddSignatureToDocumentPayload[],
        prompts: AddTextToDocumentPayload[],
        dates: AddDateToDocumentPayload[],
        texts: AddTextToDocumentPayload[],
    }

    interface RemovePositionableFromDocumentPayload {
        [indexKey: string]: string;
    }

    interface RemoveSignatureFromDocumentPayload {
        signatureIndex: string;
    }

    interface RemoveDateFromDocumentPayload {
        dateIndex: string;
    }

    interface RemoveTextFromDocumentPayload {
        textIndex: string;
    }

    interface RemovePromptFromDocumentPayload {
        promptIndex: string;
    }

    interface MovePositionablePayload {
        pageNumber?: number;
        offsetX?: number;
        offsetY?: number;
        ratioX?: number;
        ratioY?: number;
    }

    interface MoveSignaturePayload extends MovePositionablePayload {
        signatureIndex: string;
    }

    interface MoveDatePayload extends MovePositionablePayload {
        value: string;
        dateIndex: string;
        timestamp: number;
        format: string;
        height: number;
    }

    interface MoveTextPayload extends MovePositionablePayload {
        textIndex: string;
        height: number;
        value: string;
    }

    interface MovePromptPayload extends MovePositionablePayload {
        promptIndex: string;
        value: Sign.PromptInfo;
    }

    interface SignDocumentPayload {
        documentSetId: string;
        documentId: string;
        signRequestId?: number;
    }

    interface SetSignRequestStatusPayload {
        signRequestStatus: DownloadStatus;
    }

    interface ReorderDocumentsPayload {
        documentId: string;
        newIndex: number;
    }

    interface SetSignatureIdsPayload {
        signatureIds: number[];
        initialIds: number[];
        status?: Sign.DownloadStatus;
    }

    interface SetActivePagePayload {
        documentId: string;
        pageNumber: number;
    }

    interface ShowResultsPayload {
        resultDocumentId: string;
    }

    interface CloseModalPayload {
        modalName: string;
    }

    interface ShowSignConfirmationModalPayload {
        documentId: string;
        documentSetId: string;
        reject: boolean;
        isDocumentOwner: boolean;
    }

    interface ShowFailureModalPayload {
        title?: string;
        message: string;
        type?: string;
    }

    interface ShowInviteModalPayload {
        documentSetId: string;
    }


    interface ShowSigningCompleteModalPayload {
        documentSetId: string;
        exportTarget?: Sign.ExportTarget
    }
    interface ShowSessionEndedModalPayload {

    }

    interface UpdateDocumentWidthPayload {
        width: number
    }

    interface DefineRecipientsPayload {
        documentSetId: string;
        recipients: Recipients;
    }

    interface SubmitDocumentSetPayload {
        documentSetId: string;
        signatureRequests: SignatureRequest[];
    }

    interface SetActiveSignControlPayload {
        activeSignControl: Sign.SignControl;
    }

    interface SetInviteSignatoriesPayload {
        inviteSignatories: boolean;
    }


    interface SaveDocumentViewPayload {
        documentSetId: string;
        documentId: string;
    }

    interface UpdateSaveStatusPayload {
        documentId: string;
        status: Sign.SaveStatus;
    }

    interface EmailDocumentsPayload {
        documentIds: string[];
        recipients: Sign.Recipients;
    }

    interface ShowEmailDocumentsModalPayload {
        documentIds: string[];
    }

    interface UpdateModalDataPayload {
        [key: string]: any;
    }

    interface RejectDocumentPayload {
        documentId: string;
        reason?: string;
    }

    interface UpdateContactsPayload {
        status?: DownloadStatus;
        contacts?: ContactList;
    }

    interface SetSaveStatusPayload {
        documentId: string;
        status: DownloadStatus;
    }

    interface UpdateUsagePayload extends Sign.Usage{

    }

    interface ShowActivateControlModalPayload {
        documentSetId: string;
        documentId: string;
        isDocumentOwner: boolean;
        requestPrompts: Sign.DocumentPrompt[];
        requestedSignatureInfo?: Sign.RequestedSignatureDocumentInfo;
    }

    interface MarkDocumentAsCompletePayload {
        documentId: string;
        complete: boolean;
        signStatus: Sign.SignStatus;
        acceptedMessage?: string;
    }

    interface FinishedSigningDocumentPayload {
        documentId: string;
        documentSetId: string;
        reject: boolean;
        isDocumentOwner: boolean;
    }

    interface ConfirmActionPayload<T> {
        title: string;
        message: string;
        submitText: string;
        action: T;
    }

    interface RevokeSignInvitationPayload {
        signRequestId: number;
    }

    interface DeleteDocumentPayload {
        documentId: string;
    }

    interface DeleteDocumentSetPayload {
        documentSetId: string;
    }

    interface RequestVerificationPayload {
        hash: string;
    }

    interface UpdateVerificationPayload {
        hash: string;
        status: Sign.DownloadStatus;
        verified?: Verified[];
    }

    interface FinishSigningPayload {
        documentSetId: string;
    }

    interface ChangeTourPayload {
        showing: boolean;
    }

    interface UpdateUserMetaDataPayload extends Sign.UserMetaData{

    }

    interface ShowDownloadAllModalPayload {
        documentSetId: string;
    }

    interface ShowInviteTokensModalPayload {
        documentSetId: string;
    }

    interface DefineDocumentOrderPayload {
        documentSetId: string;
        documentIds: string[];
    }

    interface StartSelfSigningSessionPayload {
        documentId: string;
        documentSetId: string;
    }

    interface StartSigningSessionPayload {
        documentId: string;
        documentSetId: string;
    }

    interface EndSigningSessionPayload {

    }

    interface RequestInviteTokenPayload {
        email: string;
        documentSetId: string;
    }

    interface UpdateInviteTokenPayload {
        email: string;
        documentSetId: string;
        status: DownloadStatus;
        url?: string;
    }




    interface ResetState extends ActionCreator<ResetStatePayload> {}
    interface ResetDocuments extends ActionCreator<ResetDocumentsPayload> {}
    interface ViewDocument extends ActionCreator<ViewDocumentPayload> {}
    interface AddDocument extends ActionCreator<AddDocumentPayload> {}
    interface UpdateDocument extends ActionCreator<UpdateDocumentPayload> {}
    interface RequestDocument extends ActionCreator<RequestDocumentPayload> {}
    interface RemoveDocument extends ActionCreator<RemoveDocumentPayload> {}
    interface ReorderDocuments extends ActionCreator<ReorderDocumentsPayload> {}

    interface AddPDFToStoreAction extends ActionCreator<AddPDFToStoreActionPayload> {}
    interface FinishAddPDFToStoreAction extends ActionCreator<FinishAddPDFToStoreActionPayload> {}
    interface UpdatePDFPageToStoreAction extends ActionCreator<UpdatePDFPageToStoreActionPayload> {}
    interface UploadSignature extends ActionCreator<UploadSignaturePayload> {}
    interface DeleteSignature extends ActionCreator<DeleteSignaturePayload> {}
    interface RequestDocumentPageAction extends ActionCreator<RequestDocumentPagePayload> {}

    interface SelectSignature extends ActionCreator<SelectSignaturePayload> {}
    interface SelectInitial extends ActionCreator<SelectInitialPayload> {}
    interface AddSignatureToDocument extends ActionCreator<AddSignatureToDocumentPayload> {}
    interface AddDateToDocument extends ActionCreator<AddDateToDocumentPayload> {}
    interface AddTextToDocument extends ActionCreator<AddTextToDocumentPayload> {}
    interface AddPromptToDocument extends ActionCreator<AddPromptToDocumentPayload> {}
    interface AddOverlays extends ActionCreator<AddOverlaysPayload> {}
    interface MoveSignature extends ActionCreator<MoveSignaturePayload> {}
    interface MoveDate extends ActionCreator<MoveDatePayload> {}
    interface MoveText extends ActionCreator<MoveTextPayload> {}
    interface MovePrompt extends ActionCreator<MovePromptPayload> {}
    interface RemoveSignatureFromDocument extends ActionCreator<RemoveSignatureFromDocumentPayload> {}
    interface RemoveDateFromDocument extends ActionCreator<RemoveDateFromDocumentPayload> {}
    interface RemoveTextFromDocument extends ActionCreator<RemoveTextFromDocumentPayload> {}
    interface RemovePromptFromDocument extends ActionCreator<RemovePromptFromDocumentPayload> {}
    interface SetActiveSignControl extends ActionCreator<SetActiveSignControlPayload> {}

    interface CreateDocumentSet extends ActionCreator<DocumentSetPayload> {}
    interface UpdateDocumentSet extends ActionCreator<DocumentSetPayload> {}
    interface UpdateDocumentSets extends ActionCreator<DocumentSetsPayload> {}

    interface RequestDocumentSet extends ActionCreator<RequestDocumentSetPayload> {}
    interface RequestDocumentSets extends ActionCreator<RequestDocumentSetsPayload> {}
    interface RequestRequestedSignatures extends ActionCreator<RequestRequestedSignaturesPayload> {}
    interface UpdateRequestedSignatures extends ActionCreator<UpdateRequestedSignaturesPayload> {}

    interface SignDocument extends ActionCreator<SignDocumentPayload> {}
    interface RejectDocument extends ActionCreator<RejectDocumentPayload> {}
    interface SetSignRequestStatus extends ActionCreator<SetSignRequestStatusPayload> {}
    interface MarkDocumentAsComplete extends ActionCreator<MarkDocumentAsCompletePayload> {}
    interface FinishedSigningDocument extends ActionCreator<FinishedSigningDocumentPayload> {}

    interface RequestSignatures extends Action {}
    interface SetSignatureIds extends ActionCreator<SetSignatureIdsPayload> {}
    interface SetActivePage extends ActionCreator<SetActivePagePayload> {}

    interface ShowResults extends ActionCreator<ShowResultsPayload> {}

    interface FinishSigning extends ActionCreator<FinishSigningPayload> {}

    // Modals
    interface CloseModal extends ActionCreator<CloseModalPayload> {}
    interface UpdateModalData extends ActionCreator<UpdateModalDataPayload> {}
    interface ShowInitialSelectionModal extends Action {}
    interface ShowSignConfirmationModal extends ActionCreator<ShowSignConfirmationModalPayload> {}
    interface ShowFailureModal extends ActionCreator<ShowFailureModalPayload> {}
    interface ShowInviteModal extends ActionCreator<ShowInviteModalPayload> {}
    interface ShowEmailDocumentsModal extends ActionCreator<ShowEmailDocumentsModalPayload> {}
    interface ShowActivateControlModal extends ActionCreator<ShowActivateControlModalPayload> {}
    interface ConfirmAction<T> extends ActionCreator<ConfirmActionPayload<T>> {}
    interface ShowSigningCompleteModal extends ActionCreator<ShowSigningCompleteModalPayload> {}
    interface ShowDownloadAllModal extends ActionCreator<ShowDownloadAllModalPayload> {}
    interface ShowInviteTokensModal extends ActionCreator<ShowInviteTokensModalPayload> {}
    interface ShowSessionEndedModal extends ActionCreator<ShowSessionEndedModalPayload> {}

    interface UpdateDocumentWidth extends ActionCreator<UpdateDocumentWidthPayload> {}
    interface DefineRecipients extends ActionCreator<DefineRecipientsPayload> {}
    interface SubmitDocumentSet extends ActionCreator<SubmitDocumentSetPayload> {}

    interface SetInviteSignatories extends ActionCreator<SetInviteSignatoriesPayload> {}

    interface SaveDocumentView extends ActionCreator<SaveDocumentViewPayload> {}
    interface UpdateSaveStatus extends ActionCreator<UpdateSaveStatusPayload> {}

    interface EmailDocuments extends ActionCreator<EmailDocumentsPayload> {}

    interface ToggleToSignShowComplete extends Action {}
    interface SetSaveStatus extends ActionCreator<SetSaveStatusPayload> {}

    interface RevokeSignInvitation extends ActionCreator<RevokeSignInvitationPayload> {}
    interface DeleteDocument extends ActionCreator<DeleteDocumentPayload> {}
    interface DeleteDocumentSet extends ActionCreator<DeleteDocumentSetPayload> {}

    // Contacts
    interface RequestContacts extends Action {}
    interface UpdateContacts extends ActionCreator<UpdateContactsPayload> {}

    interface RequestUsage extends Action {}
    interface UpdateUsage extends ActionCreator<UpdateUsagePayload> {}

    interface RequestVerification extends ActionCreator<RequestVerificationPayload> {}
    interface UpdateVerification extends ActionCreator<UpdateVerificationPayload> {}

    interface ChangeTour extends ActionCreator<ChangeTourPayload> {}

    interface UpdateUserMetaData extends ActionCreator<UpdateUserMetaDataPayload> {}
    interface DefineDocumentOrder extends ActionCreator<DefineDocumentOrderPayload> {}

    interface StartSelfSigningSession extends ActionCreator<StartSelfSigningSessionPayload> {}
    interface StartSigningSession extends ActionCreator<StartSigningSessionPayload> {}

    interface EndSigningSession extends ActionCreator<EndSigningSessionPayload> {}



    interface RequestInviteToken extends ActionCreator<RequestInviteTokenPayload>{}
    interface UpdateInviteToken extends ActionCreator<UpdateInviteTokenPayload>{}

}

declare module 'pdfjs-dist/webpack' {
   var PDFJS: PDFJSStatic;
   export = PDFJS;
}

declare module 'react-signature-canvas' {
    class SignatureCanvas extends React.Component<any, any> {
        clear(): null;
        getTrimmedCanvas(): HTMLCanvasElement;
        toDataURL(): string;
    }

    export default SignatureCanvas;
}

declare namespace ReactRnd {

    type HandlerClasses = {
      bottom?: string;
      bottomLeft?: string;
      bottomRight?: string;
      left?: string;
      right?: string;
      top?: string;
      topLeft?: string;
      topRight?: string;
    }

    interface DraggableData {
        node: HTMLElement,
        x: number,
        y: number,
        deltaX: number,
        deltaY: number,
        lastX: number,
        lastY: number
    }

    interface ResizeData {
        deltaX: number;
        deltaY: number;
        lastX: number;
        lastY: number;
        node: any;
        x: number;
        y: number;
    }

    interface ReactRndProps {
        default: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        position?: {
            x: number;
            y: number;
        };
        size?: {
            width: number;
            height: number;
        }
        minWidth?: number;
        minHeight?: number;
        style?: Object;
        bounds?: string;
        resizeHandlerStyles?: Object;
        lockAspectRatio?: boolean;
        resizeHandlerClasses? : HandlerClasses;
        dragHandlerClassName? : string;
        onDrag?: (event: DraggableData, direction: any, delta: any, position: any) => void;
        onDragStop?: (event: DraggableData, resizeData: ResizeData) => void;
        onResize?: (event: any, ref: any, direction: any, delta: any, position: any) => void;
        onResizeStop?: (event: any, resizeDirection: string, element: any) => void;
        className?: string;
    }

    interface ReactRndState {
        x: number;
        y: number;
    }
}

declare module 'react-rnd' {
    class ReactRnd extends React.Component<ReactRnd.ReactRndProps, ReactRnd.ReactRndState> {
        updateSize: (data: { width: number; height: number; }) => void;
        updatePosition: (data: { x: number; y: number; }) => void;
        updateZIndex(z: number): void;
    }

    export default ReactRnd;
}

declare namespace ReactLazyLoad {
    interface Props {
        height: number;
        offsetVertical: number;
    }
}

declare module 'react-lazy-load' {
    export default class ReactLazyLoad extends React.PureComponent<ReactLazyLoad.Props> {

    }
}

declare module 'react-scroll/modules/mixins/scroller' {
    export function unmount(): void;
    export function register(name: string, element: any): void;
    export function unregister(name: string): void;
    export function get(name: string): any;
    export function setActiveLink(link: string): void;
    export function getActiveLink(): string;
    export function scrollTo(to: string, props?: any): void;
}


declare module 'react-bootstrap/lib/Popover' {
    export = ReactBootstrap.Popover;
}

declare module 'react-bootstrap/lib/OverlayTrigger' {
    export = ReactBootstrap.OverlayTrigger;
}

declare module 'react-bootstrap/lib/ButtonGroup' {
    export = ReactBootstrap.ButtonGroup;
}

declare module 'react-bootstrap/lib/Button' {
    export = ReactBootstrap.Button;
}

declare module 'react-bootstrap/lib/FormControl' {
    export = ReactBootstrap.FormControl;
}

declare module 'react-bootstrap/lib/ControlLabel' {
    export = ReactBootstrap.ControlLabel;
}

declare module 'react-bootstrap/lib/FormGroup' {
    export = ReactBootstrap.FormGroup;
}


declare module 'react-widgets/lib/localizers/moment' {
    function momentLocalizer(moment : any): void;
    namespace momentLocalizer {}
    export = momentLocalizer;
}


declare module 'react-sizeme' {
    import { ComponentClass, StatelessComponent } from "react";

    interface Options {
        refreshRate?: number;
        refreshMode?: string;
        monitorHeight?: boolean;
        monitorWidth?: boolean;
    }
    interface ComponentDecorator<P> {
        (component: ComponentClass<P>): ComponentClass<P>;
    }

    export default function sizeMe<P>(options?: Options): ComponentDecorator<P>
}


declare module 'sha.js' {
    function createHash(type: string): any;
    namespace createHash {}
    export = createHash;
}

declare module 'document-offset' {
    function offset(el: Element): {top: number; left: number};
    namespace offset {}
    export = offset;
}
