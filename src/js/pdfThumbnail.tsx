import * as React from 'react';
import { findDOMNode } from "react-dom";

interface PDFThumbnailProps {
    pdf: PDFDocumentProxy;
    width: number;
}

export default class PDFThumbnail extends React.Component<PDFThumbnailProps, {}> {
    canvas: HTMLCanvasElement;

    componentDidMount() {
        if (this.props.pdf) {
            this.renderThumbnail(this.props.pdf);
        }
    }

    componentWillReceiveProps(newProps: PDFThumbnailProps) {
        if (newProps.pdf) {
            this.renderThumbnail(newProps.pdf);
        }
    }

    renderThumbnail(pdf: PDFDocumentProxy) {
        const scale = 1;
        let canvas: HTMLCanvasElement;
        let page, canvasContext, viewport;

        pdf.getPage(0)
            .then(page => {
                canvas = findDOMNode(this.canvas) as HTMLCanvasElement;
                canvasContext = canvas.getContext('2d');
                viewport = page.getViewport(canvas.width / page.getViewport(scale).width);

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                page.render({ canvasContext, viewport });
            });
    }

    render() {
        return (
            <canvas ref={(canvas) => this.canvas = canvas} width={this.props.width} />
        );
    }
}