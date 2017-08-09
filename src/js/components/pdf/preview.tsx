import * as React from "react";
import { findDOMNode } from "react-dom";
import PDFPage from './page';
import { connect } from 'react-redux';
import LazyLoad from 'react-lazy-load';
import  * as Scroll from 'react-scroll/modules/mixins/scroller';



interface PDFPreviewProps {
    containerWidth: number;
    documentId: string;
    pageViewports: Sign.Viewport[];
    pageCount: number
}

interface ThumbProps {
    width: number;
    height: number;
    documentId: string;
    index: number;
    isActivePage: boolean;
}

class Thumb extends React.PureComponent<ThumbProps> {
    constructor(props) {
        super(props);
        this.scrollTo = this.scrollTo.bind(this);
    }
    scrollTo() {
        Scroll.scrollTo(`page-view-${this.props.index}`, {smooth: true, duration: 350, offset: -60})
    }
    componentWillUpdate(nextProps) {
        if(this.props.isActivePage !== nextProps.isActivePage && nextProps.isActivePage) {

            //Scroll.scrollTo(`page-preview-${this.props.index}`, {smooth: true, duration: 350, containerId: 'pdf-preview-panel-scroll'})
        }
    }

    render() {
        const {  index, height, width, isActivePage } = this.props;
        let classes = 'pdf-thumbnail selectable ';
        if(isActivePage){
            classes += ' active '
        }
        return <div className={classes} onClick={this.scrollTo} id={`page-preview-${index}`}>
            <div className='pdf-thumbnail-number'  >{index + 1}</div>
            <LazyLoad offsetVertical={100} height={height}  >
                <PDFPage pageNumber={index} documentId={this.props.documentId} drawWidth={width } />
            </LazyLoad>
        </div>
    }
}


const ConnectedThumb = connect(
    (state: Sign.State, ownProps: ThumbProps) => ({
        isActivePage: (state.documentViewer.documents[ownProps.documentId] || {}).activePage === ownProps.index
    }),
    {  }
)(Thumb);



export default class PDFPreview extends React.PureComponent<PDFPreviewProps> {

    render() {
        return (
            <div className='pdf-preview-panel' id="pdf-preview-panel-scroll">
                { Array(this.props.pageCount).fill(null).map((item: any, index: number) => {
                    const width = this.props.containerWidth - 30;
                    const height = this.props.pageViewports[index] ?  (width / this.props.pageViewports[index].width) * this.props.pageViewports[index].height : 100;
                    return <ConnectedThumb key={index} {...this.props} index={index} width={width} height={height}  />
                }) }
            </div>
        )
    }
}




