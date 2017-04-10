declare namespace Sign {
    export interface Document {
        id: number;
        filename: string;
        uuid?: string;
        file: File;
        arrayBuffer: ArrayBuffer;
        status: string;
        data: ArrayBuffer;
        progress?: number;
    }

    export interface Documents {
        filelist: Document[];
    }

    export interface State {
        routing: any;
        documents: Documents;
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