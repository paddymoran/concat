import * as React from "react";
import { findDOMNode } from "react-dom";
const PDFJS = require('pdfjs-dist');

interface PDFPageProps {
    page: PDFPageProxy;
    width: number;
}

export class PDFPage extends React.Component<PDFPageProps, any> {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.displayPage();
    }

    componentDidUpdate(prevProps, prevState) {
        this.displayPage();
    }

    displayPage() {
        console.log('drawing');
        const canvas = findDOMNode(this.refs.pdfPage);
        const context = canvas.getContext('2d');
        const scale = this.props.scale || 1;
        const viewport = this.props.page.getViewport(canvas.width / this.props.page.getViewport(scale).width);

        this.props.page.render({
            canvasContext: context,
            viewport: viewport
        });
    }

    render() {
        return (
            <div>
                <canvas
                    className='pdf-page'
                    ref='pdfPage' />
            </div>
        )
    }
}
