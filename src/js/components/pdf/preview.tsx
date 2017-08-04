import * as React from "react";
import { findDOMNode } from "react-dom";
import PDFPage from './page';
import { connect } from 'react-redux';
import LazyLoad from 'react-lazy-load';

interface PDFPreviewConnectProps {
    // activePageNumber: number;
    width: number;
    documentId: string;
    scale?: number;
}

interface PDFPreviewProps extends PDFPreviewConnectProps{
    pageCount: number;
}

class PDFPreview extends React.PureComponent<PDFPreviewProps> {
    render() {
        return (
            <div className='pdf-preview-panel'>
                { Array(this.props.pageCount).fill(null).map((item: any, index: number) => {
                    // let classes = index === this.props.activePageNumber ? 'pdf-thumbnail selectable selected' : 'pdf-thumbnail selectable';
                    let classes = 'pdf-thumbnail selectable';

                    return (
                        <div className={classes} key={index}>
                            <div className='pdf-thumbnail-number'>{index + 1}</div>
                            <LazyLoad offsetVertical={100} height={200}>
                                <PDFPage pageNumber={index} documentId={this.props.documentId} drawWidth={120} />
                            </LazyLoad>
                        </div>
                    );
                }) }
            </div>
        )
    }
}

export default connect(
    (state: Sign.State, ownProps: PDFPreviewConnectProps) => ({
        pageCount: state.documents[ownProps.documentId] ? state.documents[ownProps.documentId].pageCount : 0
    }),
)(PDFPreview);