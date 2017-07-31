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
    }

    interface DocumentSet {
        id?: string;
        documents: Document[];
    }

    interface Modals {
        showing?: string;
    }

    interface PDFStore {
        [id: string]: {
            document: PDFDocumentProxy;
            pages: PDFPageProxy[];
        }
    }

    interface State {
        routing: any;
        documentSet: DocumentSet;
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
        UPDATE_DOCUMENT = 'UPDATE_DOCUMENT',
        SUBMIT_DOCUMENTS = 'SUBMIT_DOCUMENTS',
        REMOVE_DOCUMENT = 'REMOVE_DOCUMENT',
        UPDATE_FORM = 'UPDATE_FORM',
        SET_DOCUMENT_SET_ID = 'SET_DOCUMENT_SET_ID',

        ADD_PDF_TO_STORE = 'ADD_PDF_TO_STORE',
        FINISH_ADD_PDF_TO_STORE = 'FINISH_ADD_PDF_TO_STORE',
        UPLOAD_SIGNATURE = 'UPLOAD_SIGNATURE',
        SELECT_SIGNATURE = 'SELECT_SIGNATURE',
        SHOW_SIGNATURE_SELECTION = 'SHOW_SIGNATURE_SELECTION',
        HIDE_SIGNATURE_SELECTION = 'HIDE_SIGNATURE_SELECTION'
    }

    interface ActionCreator<T> {
        type: Sign.Actions.Types;
        payload: T
    }

    interface Action {
        type: Sign.Actions.Types;
    }

    interface AddDocumentPayload {
        id: string;
        filename: string;
        file: File;
    }

    interface UpdateDocumentPayload {
        id: string;
        readStatus?: Sign.DocumentReadStatus;
        uploadStatus?: Sign.DocumentUploadStatus;
        data?: ArrayBuffer;
        progress?: number;
    }

    interface FinishAddPDFToStoreActionPayload {
        id: string;
        document: PDFDocumentProxy;
        pages: PDFPageProxy[];
    }

    interface AddPDFToStoreActionPayload {
        id: string;
        data: ArrayBuffer;
    }

    interface UploadSignaturePayload {
        data: ArrayBuffer;
    }

    interface AddDocument extends ActionCreator<AddDocumentPayload> {}
    interface UpdateDocument extends ActionCreator<UpdateDocumentPayload> {}

    interface AddPDFToStoreAction extends ActionCreator<AddPDFToStoreActionPayload> {}
    interface FinishAddPDFToStoreAction extends ActionCreator<FinishAddPDFToStoreActionPayload> {}
    interface UploadSignature extends ActionCreator<UploadSignaturePayload> {}
}

declare module 'pdfjs-dist' {
    export default PDFJS;
}

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