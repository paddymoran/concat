declare namespace Sign {
    interface Viewport {
        width: number,
        height: number,
    }

    const enum DocumentUploadStatus {
        NotStarted,
        InProgress,
        Complete
    }

    const enum DocumentReadStatus {
        NotStarted,
        InProgress,
        Complete
    }

    interface DocumentData {
        filename: string;
        createdAt?: string;
    }
    type SignStatus = 'Pending' | 'Signed' | 'Rejected' | 'Partial';

    interface Document extends DocumentData{
        id: string;
        file: File;
        data: ArrayBuffer;
        uploadStatus: DocumentUploadStatus;
        readStatus: DocumentReadStatus;
        progress?: number;
        pageCount?: number;
        pageViewports?: Viewport[];
        signRequestId: number;
        signStatus?:  SignStatus;
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
    }


    type DocumentSetSignStatus = 'Pending' | 'Complete' | 'Rejected' | 'Partial';

    interface DocumentSet {
        documentIds: string[];
        downloadStatus: DownloadStatus;
        title?: string;
        recipients?: Recipients;
        createdAt?: string;
        owner?: User
    }

    interface DocumentSets {
        [documentSetId: string]: DocumentSet;
    }

    type DocumentSetsStatus = DownloadStatus;

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
    }

    interface DocumentDate  extends Positionable{
        value: string;
        timestamp: number;
        format?: string;
        height: number;
    }

    interface DocumentText  extends Positionable{
        value: string;
        height: number;
    }

    interface DocumentPrompt extends Positionable{
        value: any;
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

    const enum ActiveSignControl {
        NONE,
        SIGNATURE,
        INITIAL,
        DATE,
        TEXT,
        PROMPT,
    }

    interface DocumentViewer {
        signRequestStatus: DownloadStatus;
        selectedSignatureId?: number;
        selectedInitialId?: number;
        signatures: DocumentSignatures;
        dates: DocumentDates;
        texts: DocumentTexts;
        prompts: DocumentPrompts;
        activeSignControl: ActiveSignControl;
        documents?: {
            [documentId: string] : {
                activePage: number;
            }
        }
    }

    interface PDFStore {
        [id: string]: {
            document: PDFDocumentProxy;
            pages: PDFPageProxy[];
            pageStatuses: DocumentReadStatus[];
        }
    }

    interface Signatures {
        status: DownloadStatus;
        signatureIds?: number[];
        initialIds?: number[];
    }

    interface RequestedSignatureDocumentInfo{
        prompts: DocumentPrompts;
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
    }

    const enum ModalType {
        SIGN_CONFIRMATION = 'SIGN_CONFIRMATION',
        SUBMIT_CONFIRMATION = 'SUBMIT_CONFIRMATION',
        FAILURE = 'FAILURE',
        INVITE = 'INVITE',
    }

    interface SignatureRequest {
        recipient: Recipient;
        prompts?: DocumentPrompt[],
        documentIds?: string[];
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
        SET_SIGN_REQUEST_STATUS = "SET_SIGN_REQUEST_STATUS",

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

        SHOW_RESULTS = 'SHOW_RESULTS',
        CLOSE_SHOWING_MODAL = 'CLOSE_SHOWING_MODAL',

        SHOW_SIGN_CONFIRMATION_MODAL = 'SHOW_SIGN_CONFIRMATION_MODAL',
        SHOW_SUBMIT_CONFIRMATION_MODAL = 'SHOW_SUBMIT_CONFIRMATION_MODAL',
        SHOW_FAILURE_MODAL = 'SHOW_FAILURE_MODAL',
        SHOW_INVITE_MODAL = 'SHOW_INVITE_MODAL',

        UPDATE_DOCUMENT_WIDTH = 'UPDATE_DOCUMENT_WIDTH',

        DEFINE_RECIPIENTS = 'DEFINE_RECIPIENTS',

        SUBMIT_SIGN_REQUESTS = 'SUBMIT_SIGN_REQUESTS',

        SET_INVITE_SIGNATORIES = 'SET_INVITE_SIGNATORIES',
    }

    interface ActionCreator<T> {
        type: Sign.Actions.Types;
        payload: T;
    }

    interface Action {
        type: Sign.Actions.Types;
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
        documentIds?: string[];
        documents?: Sign.Document[],
        downloadStatus?: Sign.DownloadStatus;
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
    }

    interface AddDateToDocumentPayload extends Positionable{
        dateIndex: string;
        value: string;
        timestamp: number;
        format: string;
        height: number;
    }

    interface AddTextToDocumentPayload extends Positionable{
        textIndex: string;
        value: string;
        height: number;
    }

    interface AddPromptToDocumentPayload extends Positionable{
        promptIndex: string;
        value: any;
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
        signRequestId?: number;
    }

    interface ShowSubmitConfirmationModalPayload {
        documentSetId: string;
    }

    interface ShowFailureModalPayload {
        message: string;
    }

    interface ShowInviteModalPayload {
        documentSetId: string;
    }

    interface UpdateDocumentWidthPayload {
        width: number
    }

    interface DefineRecipientsPayload {
        documentSetId: string;
        recipients: Recipients;
    }

    interface SubmitSignRequestsPayload {
        documentSetId: string;
        signatureRequests: SignatureRequest[];
    }

    interface SetActiveSignControlPayload {
        activeSignControl: Sign.ActiveSignControl;
    }

    interface SetInviteSignatoriesPayload {
        inviteSignatories: boolean;
    }


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
    interface SetSignRequestStatus extends ActionCreator<SetSignRequestStatusPayload> {}

    interface RequestSignatures extends Action {}
    interface SetSignatureIds extends ActionCreator<SetSignatureIdsPayload> {}
    interface SetActivePage extends ActionCreator<SetActivePagePayload> {}

    interface ShowResults extends ActionCreator<ShowResultsPayload> {}

    interface CloseModal extends ActionCreator<CloseModalPayload> {}
    interface ShowInitialSelectionModal extends Action {}
    interface ShowSignConfirmationModal extends ActionCreator<ShowSignConfirmationModalPayload> {}
    interface ShowSubmitConfirmationModal extends ActionCreator<ShowSubmitConfirmationModalPayload> {}
    interface ShowFailureModal extends ActionCreator<ShowFailureModalPayload> {}
    interface ShowInviteModal extends ActionCreator<ShowInviteModalPayload> {}

    interface UpdateDocumentWidth extends ActionCreator<UpdateDocumentWidthPayload> {}
    interface DefineRecipients extends ActionCreator<DefineRecipientsPayload> {}
    interface SubmitSignRequests extends ActionCreator<SubmitSignRequestsPayload> {}

    interface SetInviteSignatories extends ActionCreator<SetInviteSignatoriesPayload> {}
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

        minWidth?: number;
        minHeight?: number;
        style?: Object;
        bounds?: string;
        resizeHandlerStyles?: Object;
        lockAspectRatio?: boolean;
        resizeHandlerClasses? : HandlerClasses;
        dragHandlerClassName? : string;
        onDragStop?: (event: DraggableData, resizeData: ResizeData) => void;
        onResizeStop?: (event: any, resizeDirection: string, element: any) => void;
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
    export function scrollTo(to: string, props: any): void;
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

