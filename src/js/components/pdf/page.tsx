import * as React from "react";
import { findDOMNode } from "react-dom";
import PDFJS from 'pdfjs-dist';
import { connect } from 'react-redux';
import { getPage } from '../../actions/pdfStore';
import Loading from '../loading';

interface PDFPageConnectProps {
    drawWidth: number;
    scale?: number;
    docId: string;
    pageNumber: number;
}

interface PDFPageProps extends PDFPageConnectProps {
    page: PDFPageProxy;
    getPage: (docId: string, pageNumber: number) => void;
}

@connect(
    (state: Sign.State, ownProps: PDFPageConnectProps) => ({ page: state.pdfStore[ownProps.docId] ? state.pdfStore[ownProps.docId].pages[ownProps.pageNumber] : null }),
    { getPage }
)
export default class PDFPage extends React.PureComponent<PDFPageProps> {
    constructor(props: PDFPageProps) {
        super(props);
    }

    componentDidUpdate(prevProps: PDFPageProps) {
        debugger;
        if (this.props.page) {
            this.displayPage();
        }
    }

    componentDidMount() {
        this.props.getPage(this.props.docId, this.props.pageNumber);
    }

    displayPage() {
        const canvas : HTMLCanvasElement = findDOMNode(this.refs['pdf-canvas']) as HTMLCanvasElement;
        const context = canvas.getContext('2d');
        const scale = this.props.scale || 1;
        const viewport = this.props.page.getViewport(this.props.drawWidth / this.props.page.getViewport(scale).width);

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        this.props.page.render({ canvasContext: context, viewport: viewport });
    }

    render() {
        if (!this.props.page) {
            return <Loading />;
        }

        return <canvas ref="pdf-canvas" className='pdf-page' />;
    }
}
