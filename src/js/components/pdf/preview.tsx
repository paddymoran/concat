import * as React from "react";
import { findDOMNode } from "react-dom";
import PDFPage from './page';
import { connect } from 'react-redux';
import LazyLoad from 'react-lazy-load';
import * as Helpers from 'react-scroll/modules/mixins/Helpers';


interface PDFPreviewProps {
    // activePageNumber: number;
    containerWidth: number;
    documentId: string;
    scale?: number;
    //onSelectPage: Function;
    pageViewports: Sign.Viewport[];
    pageCount: number
}


class Thumb extends React.PureComponent<any> {
    render() {
        const {  index, height, width } = this.props;
        const classes = 'pdf-thumbnail selectable '
        return <div className={classes + (this.props.className || '')} onClick={this.props.onClick} >
            <div className='pdf-thumbnail-number'  >{index + 1}</div>
            <LazyLoad offsetVertical={100} height={height}  >
                <PDFPage pageNumber={index} documentId={this.props.documentId} drawWidth={width } />
            </LazyLoad>
        </div>
    }
}

const ThumbSpy= Helpers.Scroll(Thumb);



export default class PDFPreview extends React.PureComponent<PDFPreviewProps> {
    render() {
        return (
            <div className='pdf-preview-panel'>
                { Array(this.props.pageCount).fill(null).map((item: any, index: number) => {
                    const width = this.props.containerWidth - 30;
                    const height = this.props.pageViewports[index] ?  (width / this.props.pageViewports[index].width) * this.props.pageViewports[index].height : 100;
                    return <ThumbSpy key={index} {...this.props} index={index} width={width} height={height} spy={true} to={`page-view-${index}`} isDynamic={true} smooth={true} offset={-100} delay={0} duration={350}/>
                }) }
            </div>
        )
    }
}
