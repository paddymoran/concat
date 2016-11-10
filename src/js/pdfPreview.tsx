import * as React from "react";
import { findDOMNode } from "react-dom";
const PDFJS = require('pdfjs-dist');

interface PDFPreviewProps {
    pages: Array<PDFPageProxy>;
    activePageNumber: number;
    width: number;
    changePage: Function;
    scale?: number;
}

export class PDFPreview extends React.Component<PDFPreviewProps, any> {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.showThumbnails();
    }

    showThumbnails() {
        const scale = this.props.scale || 1;
        let page, canvas, context, viewport;

        this.props.pages.map((page, i) => {
            page = this.props.pages[i];
            canvas = findDOMNode(this.refs['preview-canvas-' + i]);
            context = canvas.getContext('2d');
            viewport = page.getViewport(canvas.width / page.getViewport(scale).width);

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            page.render({
                canvasContext: context,
                viewport: viewport
            });
        });
    }

    changeActivePage(pageNumber) {
        this.props.changePage(pageNumber);
    }

    render() {
        return (
            <div className='pdf-preview-panel'>
                { Array(this.props.pages.length).fill().map((page, i) => {
                    const pageNumber = i + 1;
                    let classes = pageNumber == this.props.activePageNumber ? 'pdf-thumbnail selectable selected' : 'pdf-thumbnail selectable';

                    return (
                        <div className={classes} key={i}>
                            <div className='pdf-thumbnail-number'>
                                {pageNumber}
                            </div>
                            
                            <canvas
                                onClick={() => { this.changeActivePage(pageNumber); }}
                                ref={'preview-canvas-' + i}
                                width={ this.props.width || 1500} />
                        </div>
                    );
                }) }
            </div>
        )
    }
}
