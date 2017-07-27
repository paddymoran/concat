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

    export interface Document {
        id: string;
        filename: string;
        file: File;
        data: ArrayBuffer;
        pdfDocumentProxy: PDFDocumentProxy;
        uploadStatus: DocumentUploadStatus;
        readStatus: DocumentReadStatus;
        progress?: number;
    }

    export interface DocumentSet {
        id?: string;
        documents: Document[];
    }

    export interface State {
        routing: any;
        documentSet: DocumentSet;
    }

    export interface Action<T> {
        type: string;
        payload: T;
        shouldCall: (state: State) => boolean;
    }

    export interface DocumentAction extends Action<any> {}

    export interface DocumentHandler {
        onDrop(files: any): void;
    }

    export interface FileDropZoneProps {
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
    }

    interface IActionCreator<T> {
        type: string
        (payload: T): Sign.Action<T>
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