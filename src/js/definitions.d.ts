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

    interface Document {
        id: string;
        filename: string;
        file: File;
        data: ArrayBuffer;
        uploadStatus: DocumentUploadStatus;
        readStatus: DocumentReadStatus;
        progress?: number;
        pageCount?: number;
        pageViewports?: Viewport[];
    }

    const enum DownloadStatus {
        NotStarted,
        InProgress,
        Complete,
        Failed,
    }

    interface DocumentSet {
        documentIds: string[];
        downloadStatus: DownloadStatus;
        title?: string;
    }

    interface DocumentSets {
        [documentSetId: string]: DocumentSet;
    }

    interface Documents {
        [documentId: string]: Document;
    }

    interface Modals {
        showing?: string;
    }

    interface DocumentSignature {
        signatureId: number;
        pageNumber: number;
        xRatio: number;
        yRatio: number;
        widthRatio?: number;
        heightRatio?: number;
    }

    interface DocumentSignatures {
        [key: string]: DocumentSignature;
    }

    interface DocumentViewer {
        signRequestStatus: DownloadStatus;
        selectedSignatureId?: number;
        signatures: DocumentSignatures;
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

    interface State {
        routing: any;
        documentSets: DocumentSets;
        documents: Documents;
        pdfStore: PDFStore;
        documentViewer: DocumentViewer;
        modals: Modals;
        signatures: Signatures;
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

    const enum DragAndDropTypes {
        ADD_SIGNATURE_TO_DOCUMENT = 'ADD_SIGNATURE_TO_DOCUMENT',
    }

    const enum DefaultSignatureSize {
        WIDTH = 200,
        HEIGHT = 100
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
        HIDE_SIGNATURE_SELECTION = 'HIDE_SIGNATURE_SELECTION',
        DELETE_SIGNATURE = 'DELETE_SIGNATURE',

        SELECT_SIGNATURE = 'SELECT_SIGNATURE',
        ADD_SIGNATURE_TO_DOCUMENT = 'ADD_SIGNATURE_TO_DOCUMENT',
        MOVE_SIGNATURE = 'MOVE_SIGNATURE',
        REMOVE_SIGNATURE_FROM_DOCUMENT = 'REMOVE_SIGNATURE_FROM_DOCUMENT',

        SIGN_DOCUMENT = "SIGN_DOCUMENT",
        SET_SIGN_REQUEST_STATUS = "SET_SIGN_REQUEST_STATUS",

        REQUEST_DOCUMENT_SET = 'REQUEST_DOCUMENT_SET',
        CREATE_DOCUMENT_SET = 'CREATE_DOCUMENT_SET',
        UPDATE_DOCUMENT_SET = 'UPDATE_DOCUMENT_SET',

        REQUEST_SIGNATURES = 'REQUEST_SIGNATURES',
        SET_SIGNATURES_REQUEST_STATUS = 'SET_SIGNATURES_REQUEST_STATUS',
        SET_SIGNATURE_IDS = 'SET_SIGNATURE_IDS',

        SET_UPLOAD_DOCUMENTS_DOCUMENT_SET_ID = 'SET_UPLOAD_DOCUMENTS_DOCUMENT_SET_ID',
        GENERATE_UPLOAD_DOCUMENTS_DOCUMENT_SET_ID = 'GENERATE_UPLOAD_DOCUMENTS_DOCUMENT_SET_ID',
        SET_ACTIVE_PAGE = 'SET_ACTIVE_PAGE',
    }

    interface ActionCreator<T> {
        type: Sign.Actions.Types;
        payload: T
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

    interface DocumentSetPayload {
        documentSetId: string;
        title?: string;
        documentIds?: string[];
        downloadStatus?: Sign.DownloadStatus;
    }

    interface RequestDocumentSetPayload {
        documentSetId: string;
    }

    interface UploadSignaturePayload {
        data: string;
    }
    interface DeleteSignaturePayload {
       signatureId: number
    }

    interface SelectSignaturePayload {
        signatureId: number;
    }

    interface AddSignatureToDocumentPayload {
        signatureIndex: string;
        signatureId: number;
        pageNumber: number;
        xOffset?: number;
        yOffset?: number;
    }

    interface RemoveSignatureFromDocumentPayload {
        signatureIndex: string;
    }

    interface MoveSignaturePayload {
        signatureIndex: string;
        pageNumber?: number;
        xRatio?: number;
        yRatio?: number;
        widthRatio?: number;
        heightRatio?: number;
    }

    interface SignDocumentPayloadSignature {
        signatureId: number;
        pageNumber: number;
        offsetX: number;
        offsetY: number;
        ratioX: number;
        ratioY: number;
    }

    interface SignDocumentPayload {
        documentSetId: string;
        documentId: string;
        signatures: SignDocumentPayloadSignature[];
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
    interface AddSignatureToDocument extends ActionCreator<AddSignatureToDocumentPayload> {}
    interface MoveSignature extends ActionCreator<MoveSignaturePayload> {}
    interface RemoveSignatureFromDocument extends ActionCreator<RemoveSignatureFromDocumentPayload> {}

    interface CreateDocumentSet extends ActionCreator<DocumentSetPayload> {}
    interface UpdateDocumentSet extends ActionCreator<DocumentSetPayload> {}

    interface RequestDocumentSet extends ActionCreator<RequestDocumentSetPayload> {}

    interface SignDocument extends ActionCreator<SignDocumentPayload> {}
    interface SetSignRequestStatus extends ActionCreator<SetSignRequestStatusPayload> {}

    interface RequestSignatures extends Action {}
    interface SetSignatureIds extends ActionCreator<SetSignatureIdsPayload> {}
    interface SetActivePage extends ActionCreator<SetActivePagePayload> {}
}

declare module 'pdfjs-dist/webpack' {
    export = PDFJS ;
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
