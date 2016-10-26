import * as React from "react";
import { findDOMNode } from "react-dom";
const PDFJS = require('pdfjs-dist');

interface PDFPageProps {
    page: PDFPageProxy;
    pageNumber: number;
    drawWidth: number;
    onResize: Function;
}

export class PDFPage extends React.Component<PDFPageProps, any> {
    constructor(props) {
        super(props);
    }

    componentDidUpdate(prevProps, prevState) {
        this.displayPage();
    }

    componentDidMount() {
        this.displayPage();
    }

    displayPage() {
        const canvas = findDOMNode(this.refs.pdfPage);
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
            <canvas ref='pdfPage' className='pdf-page' />
        )
    }
}
