import * as React from 'react';
import { findDOMNode } from "react-dom";

interface PDFThumbnailProps {
    pdf: PDFDocumentProxy;
    width: number;
    height: number;
}

interface PDFThumbnailState {
    hasRenderedThumbnail: boolean;
}

const THUMBNAIL_SCALE = 1;

export default class PDFThumbnail extends React.Component<PDFThumbnailProps, PDFThumbnailState> {
    canvas: HTMLCanvasElement;

    constructor(props: PDFThumbnailProps) {
        super(props);

        this.state = {
            hasRenderedThumbnail: false
        };
    }

    componentDidMount() {
        if (this.props.pdf) {
            this.renderThumbnail(this.props.pdf);
        }
    }

    componentDidUpdate() {
        if (this.props.pdf) {
            this.renderThumbnail(this.props.pdf);
        }
    }

    renderThumbnail(pdf: PDFDocumentProxy) {
        if (!this.state.hasRenderedThumbnail) {
            // Set rendered thumbnail flag to true
            this.setState({ hasRenderedThumbnail: true });

            // Get the first page of the PDF and render it
            pdf.getPage(1)
                .then(page => {
                    const canvas = findDOMNode(this.canvas) as HTMLCanvasElement;
                    const viewportScale = canvas.width / page.getViewport(THUMBNAIL_SCALE).width;
                    const viewport = page.getViewport(viewportScale);

                    canvas.height = this.props.height;
                    canvas.width = this.props.width;
                    const canvasContext = canvas.getContext('2d');

                    page.render({ canvasContext, viewport });
                });
        }
    }

    render() {
        return <canvas ref={(canvas) => this.canvas = canvas} width={this.props.width} height={this.props.height} />;
    }
}