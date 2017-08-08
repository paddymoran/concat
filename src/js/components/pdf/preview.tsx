import * as React from "react";
import { findDOMNode } from "react-dom";
import PDFPage from './page';
import { connect } from 'react-redux';
import LazyLoad from 'react-lazy-load';

interface PDFPreviewProps {
    // activePageNumber: number;
    containerWidth: number;
    documentId: string;
    scale?: number;
    onSelectPage: Function;
    pageViewports: Sign.Viewport[];
    pageCount: number
}


export default class PDFPreview extends React.PureComponent<PDFPreviewProps> {
    render() {
        return (
            <div className='pdf-preview-panel'>
                { Array(this.props.pageCount).fill(null).map((item: any, index: number) => {
                    let classes = 'pdf-thumbnail selectable';
                    const width = this.props.containerWidth - 30;
                    const height = this.props.pageViewports[index] ?  (width / this.props.pageViewports[index].width) * this.props.pageViewports[index].height : 100;
                    return (
                        <div className={classes} key={index}  onClick={() => this.props.onSelectPage(index)}>
                            <div className='pdf-thumbnail-number'>{index + 1}</div>
                            <LazyLoad offsetVertical={100} height={height}>
                                <PDFPage pageNumber={index} documentId={this.props.documentId} drawWidth={width } />
                            </LazyLoad>
                        </div>
                    );
                }) }
            </div>
        )
    }
}
