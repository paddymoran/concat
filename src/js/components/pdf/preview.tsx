import * as React from "react";
import { findDOMNode } from "react-dom";

interface PDFPreviewProps {
    pages: Array<PDFPageProxy>;
    activePageNumber: number;
    width: number;
    changePage: Function;
    scale?: number;
}

export class PDFPreview extends React.PureComponent<PDFPreviewProps, {}> {
    constructor(props: PDFPreviewProps) {
        super(props);
    }

    componentDidMount() {
        this.showThumbnails();
    }

    showThumbnails() {
        const scale = this.props.scale || 1;
        let canvas: HTMLCanvasElement;
        let page, canvasContext, viewport;

        this.props.pages.map((page, i) => {
            page = this.props.pages[i];
            canvas = findDOMNode(this.refs['preview-canvas-' + i]) as HTMLCanvasElement;
            canvasContext = canvas.getContext('2d');
            viewport = page.getViewport(canvas.width / page.getViewport(scale).width);

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            page.render({ canvasContext, viewport });
        });
    }

    changeActivePage(pageNumber: number) {
        this.props.changePage(pageNumber);
    }

    render() {
        return (
            <div className='pdf-preview-panel'>
                { this.props.pages.map((page: PDFPageProxy, i: number) => {
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
