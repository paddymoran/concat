import * as React from "react";
import { findDOMNode } from "react-dom";
import PDFJS from 'pdfjs-dist';
import { connect } from 'react-redux';
import Loading from '../loading';
import { requestDocument } from '../../actions/index';


interface PDFPageConnectProps {
    drawWidth: number;
    scale?: number;
    docId: string;
    pageNumber: number;
    showLoading?: boolean;
}

interface PDFPageProps extends PDFPageConnectProps {
    page: PDFPageProxy;
    requestDocument: Function;
    documentExists: boolean;
}


export class PDFPage extends React.PureComponent<PDFPageProps>  {
    private _count : number;

    constructor(props: PDFPageProps) {
        super(props);
        this.state = {
            pageRendered: false
        }
        this._count = 0;
    }

    componentWillMount() {
        if(!this.props.documentExists){
            this.props.requestDocument(this.props.docId);
        }
    }

    componentDidUpdate(prevProps: PDFPageProps) {
        if (this.props.page) {
            this.displayPage();
        }
    }

    componentDidMount() {
        if (this.props.page) {
            this.displayPage()
        }
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
            if(!this.props.showLoading){
                return false;
            }
            return <Loading />;
        }

        return <canvas key={this._count++} ref="pdf-canvas" className='pdf-page' />;
    }
}

export default connect(
    (state: Sign.State, ownProps: PDFPageConnectProps) => ({
        page: state.pdfStore[ownProps.docId] ? state.pdfStore[ownProps.docId].pages[ownProps.pageNumber] : null,
        documentExists: !!state.documentSet.documents.find(d => d.id === ownProps.docId)
    }),
    {
        requestDocument
    }
)(PDFPage);