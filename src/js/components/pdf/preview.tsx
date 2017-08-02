import * as React from "react";
import { findDOMNode } from "react-dom";
import PDFPage from './page';
import { connect } from 'react-redux';


interface PDFPreviewConnectProps {
    activePageNumber: number;
    width: number;
    changePage?: Function;
    documentId: string;
    scale?: number;
}

interface PDFPreviewProps extends PDFPreviewConnectProps{
    pageCount: number;
}

export class PDFPreview extends React.PureComponent<PDFPreviewProps> {

    changeActivePage(pageNumber: number) {
        this.props.changePage(pageNumber);
    }

    render() {
        return (
            <div className='pdf-preview-panel'>
                { Array(this.props.pageCount).fill(null).map((item: any, index: number) => {
                    let classes = index === this.props.activePageNumber ? 'pdf-thumbnail selectable selected' : 'pdf-thumbnail selectable';
                    return <div className={classes} key={index}>
                            <div className='pdf-thumbnail-number'>
                                {index + 1}
                            </div>
                            <PDFPage pageNumber={index} documentId={this.props.documentId} drawWidth={120} />

                          </div>
                }) }
            </div>
        )
    }
}

export default connect(
    (state: Sign.State, ownProps: PDFPreviewConnectProps) => ({
        pageCount: state.documents[ownProps.documentId].pageCount
    }),
)(PDFPreview);