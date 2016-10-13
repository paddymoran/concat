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
        this.state = {
            pageNumber: 1
        };
        this.completeDocument = this.completeDocument.bind(this);
    }

    componentDidMount() {
        if (this.props.worker === false) {
            PDFJS.disableWorker = true;
        }
        this.loadDocument(this.props);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    componentWillReceiveProps(newProps) {
        if (newProps.data && newProps.data !== this.props.data) {
            this.loadDocument(newProps);
        }
    }

    loadDocument(props) {
        if (props.data || props.url) {
            this.cleanup();
            this._pdfPromise = Promise.resolve(PDFJS.getDocument(props.data ? { data: props.data } : props.url))
                .then(this.completeDocument)
                .catch(PDFJS.MissingPDFException, () => this.setState({error: "Can't find PDF"}))
                .catch((e) => this.setState({error: e.message}))
        }
    }

    completeDocument(pdf) {
        this.setState({ pdf: pdf, error: null });
        this._pagePromises && this._pagePromises.isPending() && this._pagePromises.cancel();

        this._pagePromises = pdf.getPage(this.props.pageNumber);
        this._pagePromises.then((page) => {
            this.setState({ page: page });
        })
        .catch((e) => {
            throw e;
        }).then(() => {
            return this._pagePromises;
        });
    }

    componentWillUnmount() {
        this.cleanup();
    }

    cleanup() {
        this._pdfPromise && this._pdfPromise.isPending() && this._pdfPromise.cancel();
        this._pagePromises && this._pagePromises.isPending() && this._pagePromises.cancel();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ pageNumber: nextProps.pageNumer });
    }

    componentDidUpdate() {
        console.log(1);
        if (this.state.pdf && this.state.page) {
            const canvas = findDOMNode(this.refs.pdfPage);
            const context = canvas.getContext('2d');
            const scale = this.props.scale || 1;
            const viewport = this.state.page.getViewport(canvas.width / this.state.page.getViewport(scale).width);
            
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            this.state.page.render({
                canvasContext: context,
                viewport: viewport
            });

            this.props.finished && this.props.finished();
        }
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
