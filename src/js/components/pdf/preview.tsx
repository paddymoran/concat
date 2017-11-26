import * as React from "react";
import { findDOMNode } from "react-dom";
import PDFPage from './page';
import { connect } from 'react-redux';
import LazyLoad from 'react-lazy-load';
import  * as Scroll from 'react-scroll/modules/mixins/scroller';
import sizeMe from 'react-sizeme';

interface ThumbProps {
    width: number;
    height: number;
    documentId: string;
    index: number;
}

interface ConnectedThumbProps extends ThumbProps {
    isActivePage: boolean;
}

class Thumb extends React.PureComponent<ConnectedThumbProps> {
    constructor(props : ConnectedThumbProps) {
        super(props);
        this.scrollTo = this.scrollTo.bind(this);
    }
    scrollTo() {
        Scroll.scrollTo(`page-view-${this.props.index}`, {smooth: true, duration: 350, offset: -60})
    }

    render() {
        const {  index, height, width, isActivePage } = this.props;
        let classes = 'pdf-thumbnail selectable ';
        if(isActivePage){
            classes += ' active '
        }

        return <div className={classes} onClick={this.scrollTo} id={`page-preview-${index}`}>
            <div className='pdf-thumbnail-number'  >{index + 1}</div>
            <LazyLoad key={`${index}-${height}`} offsetVertical={100} height={height}  >
                <PDFPage pageNumber={index} documentId={this.props.documentId} drawWidth={width } />
            </LazyLoad>
        </div>
    }
}


const ConnectedThumb = connect(
    (state: Sign.State, ownProps: ThumbProps) => ({
        isActivePage: (state.documentViewer.documents[ownProps.documentId] || {activePage: 0}).activePage === ownProps.index
    })
)(Thumb);


export class UndimensionedPDFPreview extends React.PureComponent<Sign.Components.SizedPDFPreviewProps> {

    render() {
        return <div>
        { Array(this.props.pageCount).fill(null).map((item: any, index: number) => {
            const width = this.props.size.width-10; //minus border
            const defaultHeight = width * Math.sqrt(2);
            const height = this.props.pageViewports[index] ?  (width / this.props.pageViewports[index].width) * this.props.pageViewports[index].height : defaultHeight;
            return <ConnectedThumb key={index} {...this.props} index={index} width={width} height={height}  />
        }) }
        </div>
    }
}

const DimensionedPDFPreview = sizeMe<Sign.Components.PDFPreviewProps>({refreshRate: 300})(UndimensionedPDFPreview);

export default class PDFPreview extends React.PureComponent<Sign.Components.PDFPreviewProps> {

    render() {
        return (
            <div className='pdf-preview-panel' id="pdf-preview-panel-scroll">
                <DimensionedPDFPreview {...this.props} />
            </div>
        )
    }
}




