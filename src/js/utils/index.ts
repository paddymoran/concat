export function findSetForDocument(documentSets: Sign.DocumentSets, documentId: string) {
    return Object.keys(documentSets).find(key => documentSets[key].documentIds.includes(documentId));
}

export function signatureUrl(signatureId: number) {
    return `/api/signatures/${signatureId}`;
}