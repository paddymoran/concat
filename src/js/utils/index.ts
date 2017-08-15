import * as Promise from 'bluebird';

export function findSetForDocument(documentSets: Sign.DocumentSets, documentId: string) {
    return Object.keys(documentSets).find(key => documentSets[key].documentIds.includes(documentId));
}

export function signatureUrl(signatureId: number) {
    return `/api/signatures/${signatureId}`;
}

export function boundNumber(number: number, min: number, max: number) {
    if (number < min) {
        return min;
    }

    if (number > max) {
        return max;
    }

    return number;
}

export function imageRatio(url: string) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve(img.width/img.height);
        };
        img.onerror = () => {
            resolve(1);
        }
        img.src = url;
    });
}