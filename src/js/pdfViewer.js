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
    documentLoaded?: Function;
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
                .then((pdf) => {
                    if (this.props.documentLoaded) {
                        this.props.documentLoaded(pdf);
                    }
                    return pdf;
                })
                .then(this.completeDocument)
                .catch(PDFJS.MissingPDFException, () => this.setState({error: "Can't find PDF"}))
                .catch((e) => this.setState({error: e.message}))
        }
    }

    completeDocument(pdf) {
        this.setState({ pdf: pdf, error: null });
        this._pagePromises && this._pagePromises.isPending() && this._pagePromises.cancel();

        return this._pagePromises = Promise.map(Array(this.state.pdf.numPages).fill(), (p, i) => {
            return pdf.getPage(i + 1);
        })
        .then((pages) => {
            this.setState({ pages: pages });
            return pages;
        })
        .then((pages) => {
            this.loadPage(this.props.pageNumber);
        });
    }

    componentWillUnmount() {
        this.cleanup();
    }

    cleanup() {
        this._pdfPromise && this._pdfPromise.isPending() && this._pdfPromise.cancel();
        this._pagePromises && this._pagePromises.isPending() && this._pagePromises.cancel();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.pageNumber != prevProps.pageNumber) {
            this.loadPage(this.props.pageNumber);
        }
    }

    loadPage(pageNumber) {
        const pageIndex = pageNumber - 1;

        if (this.state.pages && this.state.pages[pageIndex]) {
            const page = this.state.pages[pageIndex];

            const canvas = findDOMNode(this.refs.pdfPage);
            const context = canvas.getContext('2d');
            const scale = this.props.scale || 1;
            const viewport = page.getViewport(canvas.width / page.getViewport(scale).width);
            
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            page.render({
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
            return <div>Loading...</div>
        }

        return (
            <div>
                <PDFPreview />
                <PDFPage />
            </div>
        )
    }
}
