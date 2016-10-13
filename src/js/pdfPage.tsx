import * as React from "react";
import { findDOMNode } from "react-dom";
import * as Promise from 'bluebird';
const PDFJS = require('pdfjs-dist');

Promise.config({
    cancellation: true
});

interface PDFPageProps {
    data: ArrayBuffer;
    pageNumber: number;
    width: number;
    finished: Function;
    worker?: boolean;
    url?: string;
}

export class PDFPage extends React.Component<PDFPageProps, any> {
    _pdfPromise;
    _pagePromises;

    constructor(props) {
        super(props);
        this._pdfPromise = null;
        this._pagePromises = null;
        this.state = {};
        this.completeDocument = this.completeDocument.bind(this);
    }

    componentDidMount() {
        if (this.props.worker === false) {
            PDFJS.disableWorker = true;
        }
        this.loadDocument(this.props);
        if (this.state.pdf && this.state.page) {
            this.loadPage(this.props.pageNumber);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    componentWillReceiveProps(newProps) {
        if (newProps.data && newProps.data !== this.props.data) {
            this.loadDocument(newProps);
        }
    }

    loadDocument(newProps) {
        if (newProps.data || newProps.url) {
            this.cleanup();
            this._pdfPromise = Promise.resolve(PDFJS.getDocument(newProps.data ? { data: newProps.data } : newProps.url))
                .then((pdf) => { this.handleDocumentUpload(pdf) })
                .then(() => { this.loadPage(this.props.pageNumber) })
                .catch(PDFJS.MissingPDFException, () => this.setState({error: "Can't find PDF"}))
                .catch((e) => this.setState({error: e.message}))
        }
    }

    handleDocumentUpload(pdf) {
        this.setState({ pdf: pdf, error: null });
        return this._pdfPromise;
    }

    completeDocument(pdf, newProps) {
        this.setState({ pdf: pdf, error: null });
        this._pagePromises && this._pagePromises.isPending() && this._pagePromises.cancel();
        this._pagePromises = pdf.getPage(newProps.pageNumber);
        this._pagePromises.then((page) => {
            this.setState({ page: page });
        })
        .catch((e) => {
            throw e;
        });

        return this._pagePromises;
    }

    componentWillUnmount() {
        this.cleanup();
    }

    cleanup() {
        this._pdfPromise && this._pdfPromise.isPending() && this._pdfPromise.cancel();
        this._pagePromises && this._pagePromises.isPending() && this._pagePromises.cancel();
    }

    componentDidUpdate() {
        if (this.state.pdf && this.state.page) {
            this.loadPage(this.props.pageNumber);
        }
    }

    loadPage(pageNumber) {
        console.log(100);
        // let promise = this.state.pdf.getPage(this.props.pageNumber);
        // promise.then((newPage) => {
        //     this.setState({ page: newPage });
        // }).then(() => {
        //     const canvas = findDOMNode(this.refs.pdfPage);
        //     const context = canvas.getContext('2d');
        //     const scale = this.props.scale || 1;
        //     const viewport = this.state.page.getViewport(canvas.width / this.state.page.getViewport(scale).width);
            
        //     canvas.height = viewport.height;
        //     canvas.width = viewport.width;

        //     this.state.page.render({
        //         canvasContext: context,
        //         viewport: viewport
        //     });

        //     this.props.finished && this.props.finished();
        // });
    }

    render() {
        if (this.state.error) {
            return <div>{ this.state.error }</div>
        }

        if (!this.state.pdf) {
            return <div>No Document to show</div>
        }

        return (
            <div>
                <canvas ref='pdfPage' width={ this.props.width || 1500}  />
            </div>
        )
    }
}
