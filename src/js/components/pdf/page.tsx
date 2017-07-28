import * as React from "react";
import { findDOMNode } from "react-dom";
import PDFJS from 'pdfjs-dist';
import { connect } from 'react-redux';
import { getPage } from '../../actions/pdfStore';

interface PDFPageProps {
    page: PDFPageProxy;
    drawWidth: number;
    scale?: number;
    docId: string;
    getPage: (docId: string, pageNumber: number) => void;
    pageNumber: number;
}

@connect(undefined, { getPage })
export class PDFPage extends React.PureComponent<PDFPageProps, {}> {

    constructor(props: PDFPageProps) {
        super(props);
    }

    componentDidUpdate(prevProps: PDFPageProps) {
        this.displayPage();
    }

    componentDidMount() {
        this.props.getPage(this.props.docId, this.props.pageNumber);
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
        return <canvas ref="pdf-canvas" className='pdf-page' />;
    }
}
