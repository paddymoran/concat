export type Document = {
    id: number;
    filename: string;
    uuid?: string;
    file: File;
    arrayBuffer: ArrayBuffer;
    status: string;
    data: ArrayBuffer;
    progress?: number;
};