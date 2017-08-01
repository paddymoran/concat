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
        SELECT_SIGNATURE = 'SELECT_SIGNATURE',
        SHOW_SIGNATURE_SELECTION = 'SHOW_SIGNATURE_SELECTION',
        HIDE_SIGNATURE_SELECTION = 'HIDE_SIGNATURE_SELECTION',
        DELETE_SIGNATURE = 'HIDE_SIGNATURE',

        REQUEST_DOCUMENT_SET = 'REQUEST_DOCUMENT_SET',
        CREATE_DOCUMENT_SET = 'CREATE_DOCUMENT_SET',
        UPDATE_DOCUMENT_SET = 'UPDATE_DOCUMENT_SET',
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
        data: ArrayBuffer;
    }
    interface DeleteSignaturePayload {
       payload: number
    }
    interface AddDocument extends ActionCreator<AddDocumentPayload> {}
    interface UpdateDocument extends ActionCreator<UpdateDocumentPayload> {}
    interface RequestDocument extends ActionCreator<RequestDocumentPayload> {}

    interface AddPDFToStoreAction extends ActionCreator<AddPDFToStoreActionPayload> {}
    interface FinishAddPDFToStoreAction extends ActionCreator<FinishAddPDFToStoreActionPayload> {}
    interface UpdatePDFPageToStoreAction extends ActionCreator<UpdatePDFPageToStoreActionPayload> {}
    interface UploadSignature extends ActionCreator<UploadSignaturePayload> {}
    interface DeleteSignature extends ActionCreator<DeleteSignaturePayload> {}
    interface RequestDocumentPageAction extends ActionCreator<RequestDocumentPagePayload> {}

    interface CreateDocumentSet extends ActionCreator<DocumentSetPayload> {}
    interface UpdateDocumentSet extends ActionCreator<DocumentSetPayload> {}

    interface RequestDocumentSet extends ActionCreator<RequestDocumentSetPayload> {}
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

declare module 'react-rnd' {
    interface ReactRndProps {
        initial: {
            x: number;
            y: number;
            width: number;
            height: number;
        };

        minWidth: number;
        maxWidth: number;
        style: Object;
        bounds: string;
        resizerHandleStyle: Object;
        lockAspectRatio: boolean;
    }

    interface ReactRndState {
        x: number;
        y: number;
    }

    class ReactRnd extends React.Component<ReactRndProps, ReactRndState> { }

    export default ReactRnd;
}