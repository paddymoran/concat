declare namespace Sign {
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
        x: number;
        y: number;
        width?: number;
        height?: number;
    }

    interface DocumentViewer {
        signRequestStatus: DownloadStatus;
        selectedSignatureId?: number;
        signatures: DocumentSignature[];
    }

    interface PDFStore {
        [id: string]: {
            document: PDFDocumentProxy;
            pages: PDFPageProxy[];
            pageStatuses: DocumentReadStatus[];
        }
    }

    interface State {
        routing: any;
        documentSets: DocumentSets;
        documents: Documents;
        pdfStore: PDFStore;
        documentViewer: DocumentViewer;
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

        SIGN_DOCUMENT = "SIGN_DOCUMENT",
        SET_SIGN_REQUEST_STATUS = "SET_SIGN_REQUEST_STATUS",

        REQUEST_DOCUMENT_SET = 'REQUEST_DOCUMENT_SET',
        CREATE_DOCUMENT_SET = 'CREATE_DOCUMENT_SET',
        UPDATE_DOCUMENT_SET = 'UPDATE_DOCUMENT_SET',
        
        SET_UPLOAD_DOCUMENTS_DOCUMENT_SET_ID = 'SET_UPLOAD_DOCUMENTS_DOCUMENT_SET_ID',
        GENERATE_UPLOAD_DOCUMENTS_DOCUMENT_SET_ID = 'GENERATE_UPLOAD_DOCUMENTS_DOCUMENT_SET_ID',
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
    }

    interface FinishAddPDFToStoreActionPayload {
        id: string;
        document: PDFDocumentProxy;
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
        signatureId: number;
        pageNumber: number;
    }

    interface MoveSignaturePayload {
        signatureIndex: number;
        pageNumber?: number;
        x?: number;
        y?: number;
        width?: number;
        height?: number;
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

    interface AddDocument extends ActionCreator<AddDocumentPayload> {}
    interface UpdateDocument extends ActionCreator<UpdateDocumentPayload> {}
    interface RequestDocument extends ActionCreator<RequestDocumentPayload> {}
    interface RemoveDocument extends ActionCreator<RemoveDocumentPayload> {}

    interface AddPDFToStoreAction extends ActionCreator<AddPDFToStoreActionPayload> {}
    interface FinishAddPDFToStoreAction extends ActionCreator<FinishAddPDFToStoreActionPayload> {}
    interface UpdatePDFPageToStoreAction extends ActionCreator<UpdatePDFPageToStoreActionPayload> {}
    interface UploadSignature extends ActionCreator<UploadSignaturePayload> {}
    interface DeleteSignature extends ActionCreator<DeleteSignaturePayload> {}
    interface RequestDocumentPageAction extends ActionCreator<RequestDocumentPagePayload> {}

    interface SelectSignature extends ActionCreator<SelectSignaturePayload> {}
    interface AddSignatureToDocument extends ActionCreator<AddSignatureToDocumentPayload> {}
    interface MoveSignature extends ActionCreator<MoveSignaturePayload> {}

    interface CreateDocumentSet extends ActionCreator<DocumentSetPayload> {}
    interface UpdateDocumentSet extends ActionCreator<DocumentSetPayload> {}

    interface RequestDocumentSet extends ActionCreator<RequestDocumentSetPayload> {}

    interface SignDocument extends ActionCreator<SignDocumentPayload> {}
    interface SetSignRequestStatus extends ActionCreator<SetSignRequestStatusPayload> {}
}
/*
declare module 'pdfjs-dist' {
   export default  PDFJS ;
}*/

declare module 'react-signature-canvas' {
    class SignatureCanvas extends React.Component<any, any> {
        clear(): null;
        getTrimmedCanvas(): HTMLCanvasElement;
        toDataURL(): string;
    }

    export default SignatureCanvas;
}

declare namespace ReactRnd {
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
        maxHeight?: number;
        style: Object;
        bounds: string;
        resizeHandlerStyles: Object;
        lockAspectRatio: boolean;

        onDragStop?: (event: DraggableData, resizeData: ResizeData) => void;
        onResizeStop?: (event: any, resizeHandle: string, element: any) => void;
    }

    interface ReactRndState {
        x: number;
        y: number;
    }
}

declare module 'react-rnd' {
    class ReactRnd extends React.Component<ReactRnd.ReactRndProps, ReactRnd.ReactRndState> { }

    export default ReactRnd;
}