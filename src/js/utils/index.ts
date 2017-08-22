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
        };
        img.src = url;
    });
}


export function stringToCanvas(height: number, string: string, minWidth = 0) {
    const canvas = document.createElement('canvas');
    const canvasHeight = height;
    canvas.height = canvasHeight;
    canvas.width = 10;
    const margin = canvasHeight / 8;
    const ctx = canvas.getContext('2d');
    const font = `bold ${canvas.height-(margin*2)}px san serif`;
    ctx.font = font;
    const textLength = ctx.measureText(string).width;
    canvas.width = Math.max(minWidth, textLength + (margin * 2));

    ctx.font = font;
    ctx.fillStyle = '#000'
    ctx.textBaseline="top";
    ctx.fillText(string, margin, margin);
    return canvas;
}


export function debounce(func: () => void, wait = 50) {
    let h: number;
    return () => {
        // use window so TS knows its not node
        window.clearTimeout(h);
        h = window.setTimeout(() => func(), wait);
    };
}