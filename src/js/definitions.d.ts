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
        pdfDocumentProxy: PDFDocumentProxy;
        uploadStatus: DocumentUploadStatus;
        readStatus: DocumentReadStatus;
        progress?: number;
    }

    interface DocumentSet {
        id?: string;
        documents: Document[];
    }

    interface IPDFStore {
        [id: string]: {
            document: PDFDocumentProxy;
            pages: PDFPageProxy[];
        }
    }

    interface State {
        routing: any;
        documentSet: DocumentSet;
        pdfStore: IPDFStore;
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
        GET_PAGE_FROM_PDF_STORE = 'GET_PAGE_FROM_PDF_STORE',
    }

    interface IActionCreator<T> {
        type: string
        (payload: T): Sign.Action<T>
    }

    interface IAction {
        type: Sign.Actions.Types;
    }

    interface IAddPDFToStoreAction extends IAction {
        payload: {
            id: string;
            document: PDFDocumentProxy;
            pages: PDFPageProxy[];
        };
    }
    
    interface IGetPageFromPDFStoreAction extends IAction {
        payload: {
            docId: string;
            pageNumber: number;
        };
    }
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