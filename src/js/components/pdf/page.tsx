import * as React from "react";
import { findDOMNode } from "react-dom";
import PDFJS from 'pdfjs-dist';

interface PDFPageProps {
    page: PDFPageProxy;
    drawWidth: number;
    scale?: number;
}

interface PDFPageState {}


export class PDFPage extends React.PureComponent<PDFPageProps, PDFPageState> {
    private pdfPage: HTMLCanvasElement;

    constructor(props: PDFPageProps) {
        super(props);
    }

    componentDidUpdate(prevProps: PDFPageProps, prevState: PDFPageState) {
        this.displayPage();
    }

    componentDidMount() {
        this.displayPage();
    }

    displayPage() {
        const canvas : HTMLCanvasElement = findDOMNode(this.refs['pdf-canvas']) as HTMLCanvasElement;
        const context = canvas.getContext('2d');
        const scale = this.props.scale || 1;
        const viewport = this.props.page.getViewport(this.props.drawWidth / this.props.page.getViewport(scale).width);

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        this.props.page.render({
            canvasContext: context,
            viewport: viewport
        });
    }

    render() {
        return (
            <canvas ref="pdf-canvas" className='pdf-page' />
        )
    }
}
