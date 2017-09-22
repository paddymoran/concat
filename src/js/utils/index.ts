import * as Promise from 'bluebird';
import * as moment from 'moment';



export function findSetForDocument(documentSets: Sign.DocumentSets, documentId: string): string {
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

export function promptToCanvas(width: number, height: number, recipient: string, type: string, required: boolean) {
    const canvas = document.createElement('canvas');
    canvas.height = height;
    canvas.width = width;
    const margin = height / 8;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(250, 255, 179, 0.56)';
    ctx.fillRect(0,0,width, height);
    const fontsize = (canvas.height/2-(margin)) * 0.9;
    let font = `bold ${fontsize}px arial`;
    ctx.font = font;
    ctx.fillStyle = required ? '#a6171d' : '#000'
    ctx.textBaseline="top";
    ctx.textAlign="center";
    ctx.fillText(recipient, width / 2, margin, width - (margin * 2));
    font = `bold ${(fontsize)*0.75}px arial`;
    ctx.font = font;
    ctx.fillStyle =  '#000'
    ctx.fillText(type.toUpperCase(), width / 2, height / 2 + margin /2 , width - (margin * 2));
    return canvas;
}

export function requestPromptToCanvas(width: number, height: number, type: string) {
    const canvas = document.createElement('canvas');
    canvas.height = height;
    canvas.width = width;
    const margin = height / 8;
    const ctx = canvas.getContext('2d');
    const colors : any = {
        'signature': 'rgba(30,138,19, 0.8)',
        'initial':'rgba(14,104,97, 0.8)',
        'date':'rgba(169,87,23, 0.8)',
        'text':'rgba(166,23,30,0.8)',
    };
    ctx.fillStyle = colors[type]
    ctx.fillRect(0,0,width, height);
    const fontsize = (canvas.height/2-(margin)) * 0.9;
    let font = `bold ${fontsize}px arial`;
    ctx.font = font;
    ctx.textBaseline="top";
    ctx.textAlign="center";
    ctx.fillStyle =  '#fff'
    ctx.fillText(type.toUpperCase(), width / 2, margin  , width - (margin * 2));

    font = `bold ${(fontsize)*0.75}px arial`;
    ctx.font = font;
    ctx.fillText('HERE', width / 2, height / 2 + margin /2 , width - (margin * 2));
    return canvas;
}

export function signatureCanvasMinDimensions(canvas: HTMLCanvasElement, minXY = Sign.DefaultSignatureSize.MIN_XY_RATIO, maxXY = Sign.DefaultSignatureSize.MAX_XY_RATIO) {
    const width = canvas.width, height = canvas.height;
    const ratio = width / height;

    if(ratio < minXY) {
        // not wide enough,
        const newWidth = height / minXY;
        const newCanvas = document.createElement('canvas');
        newCanvas.height = height;
        newCanvas.width = newWidth;
        const newCtx = newCanvas.getContext('2d');
        newCtx.drawImage(canvas, (newWidth - width) / 2, 0)
        return newCanvas;
    }
    else if(ratio > maxXY){
        // too wide enough,
        const newHeight = width / maxXY;
        const newCanvas = document.createElement('canvas');
        newCanvas.height = newHeight;
        newCanvas.width = width;
        const newCtx = newCanvas.getContext('2d');
        newCtx.drawImage(canvas, 0, (newHeight - height) / 2)
        return newCanvas;
    }
    return canvas;
}

export function debounce(func: any, wait = 50) {
    let h: number;
    return (...args : any[]) => {
        // use window so TS knows its not node
        window.clearTimeout(h);
        h = window.setTimeout(() => func(...args), wait);
    };
}


export function dateDefaults(){
    const format = 'DD MMMM YYYY', timestamp = (new Date()).getTime();
    return {
        format,
        value: moment(timestamp).format(format),
        timestamp
    }
}

export function textDefaults(){
    const value = 'Custom Text...';
    return {
        value
    }
}


export const datetimeFormat = "D MMMM YYYY, h:mm:ss a";

export function stringToDateTime(string : string) : string {
    return moment(string).format(datetimeFormat);
}

export function signDocumentRoute(documentSetId: string, documentId: string, isDocumentOwner: boolean) {
    if (isDocumentOwner) {
        return `/documents/${documentSetId}/${documentId}`;
    }

    return `/sign/${documentSetId}/${documentId}`;
}

export function getNextDocument(documentIds: string[], documents: Sign.DocumentViews, currentDocumentId: string): string {
    return (documentIds||[]).filter(d => d != currentDocumentId).find(documentId => {
        const document = documents[documentId];
        let needsSigned = true;
        if (document) {
            if (document.completed) {
                needsSigned = false;
            }
        }

        return needsSigned;
    });
}


export function formatUsage(data: any) : Sign.Usage {
    return {
        status: Sign.DownloadStatus.Complete,
        amountPerUnit: data.amount_per_unit,
        maxAllowanceReached: data.max_allowance_reached,
        requestedThisUnit: data.requested_this_unit,
        signedThisUnit: data.signed_this_unit,
        unit: data.unit
    }
}

export function formatUser(data: any) : Sign.CurrentUser {
    return {
        userId: data.user_id,
        name: data.name,
        email: data.email,
        emailVerified: data.email_verified,
        subscribed: data.subscribed
    }
}

export function fileSize(b:number) {
    var u = 0, s=1024;
    while (b >= s || -b >= s) {
        b /= s;
        u++;
    }
    return (u ? b.toFixed(1) + ' ' : b) + ' KMGTPEZY'[u] + 'B';
}



export function massageDefaultPrompts(overlayDefaults : Sign.OverlayDefaults, documentSet : Sign.DocumentSet){
    if(overlayDefaults.prompt && documentSet.recipients && documentSet.recipients.length > 1){
        overlayDefaults = {...overlayDefaults, prompt: {...overlayDefaults.prompt, value: {...overlayDefaults.prompt.value, recipientEmail: ''}}}
    }
    return overlayDefaults;
}