import * as React from "react";
import { findDOMNode } from "react-dom";
import PDFPage from './page';
import { connect } from 'react-redux';
import LazyLoad from 'react-lazy-load';
import  * as Scroll from 'react-scroll/modules/mixins/scroller';


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
    componentWillUpdate(nextProps : ConnectedThumbProps) {
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
        isActivePage: (state.documentViewer.documents[ownProps.documentId] || {activePage: 0}).activePage === ownProps.index
    })
)(Thumb);



export default class PDFPreview extends React.PureComponent<Sign.Components.SizedPDFPreviewProps> {

    render() {
        return (
            <div className='pdf-preview-panel' id="pdf-preview-panel-scroll">
                { Array(this.props.pageCount).fill(null).map((item: any, index: number) => {
                    const width = this.props.size.width - 30;
                    const defaultHeight = width * Math.sqrt(2);
                    const height = this.props.pageViewports[index] ?  (width / this.props.pageViewports[index].width) * this.props.pageViewports[index].height : defaultHeight;
                    return <ConnectedThumb key={index} {...this.props} index={index} width={width} height={height}  />
                }) }
            </div>
        )
    }
}




