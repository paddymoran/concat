import * as React from 'react';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PDFThumbnail from './pdfThumbnail';

interface DocumentViewProps {
    document: Sign.Document;
    removeDocument: Function;
    pdf: PDFDocumentProxy;
}

interface DocumentListProps {
    documents: Sign.Document[];
    removeDocument: Function;
    getPDF: Function;
};

const DocumentView = (props: DocumentViewProps) => (
    <div className="document">
        <button className="remove" onClick={() => props.removeDocument()}>✖</button>
        
        {/*<div className="image">{ props.document.uuid && <img src={`/api/documents/thumb/${props.document.uuid}`} /> }</div>*/}
        <PDFThumbnail pdf={props.pdf} width={150} />
        <div className="filename">{ props.document.filename }</div>
        
        <ReactCSSTransitionGroup transitionName="progress" transitionEnterTimeout={300} transitionLeaveTimeout={500}>
            { props.document.uploadStatus === Sign.DocumentUploadStatus.InProgress &&
                <div className="progress" key="progress">
                    <div className="progress-bar progress-bar-striped active" style={{width: `${props.document.progress*100}%`}}></div>
                </div>
            }
        </ReactCSSTransitionGroup>
    </div>
);


interface PDFDocumentDictionary {
    [key: string]: PDFDocumentProxy;
}

interface DocumentListState {
    pdfs: PDFDocumentDictionary;
}

export default class DocumentList extends React.Component<DocumentListProps, DocumentListState> {
    constructor(props: DocumentListProps) {
        super(props);

        this.state = {
            pdfs: {}
        };
    }

    componentDidMount() {
        this.readPdfsToState(this.props.documents);
    }
    
    componentWillUpdate(nextProps: DocumentListProps, netState: DocumentListState) {
        this.readPdfsToState(nextProps.documents);
    }

    readPdfsToState(documents: Sign.Document[]) {
        console.log('wanting to read pdf');
        documents.map(doc => {
            console.log('working on doc: ' + doc.id);
            console.log(`in state: ${!!this.state.pdfs[doc.id]} | status: ${doc.readStatus}`);
            if (doc.id && !this.state.pdfs[doc.id] && doc.readStatus === Sign.DocumentReadStatus.Complete) {
                this.props.getPDF(doc.id)
                    .then((pdf: PDFDocumentProxy) => {
                        const pdfs = { ...this.state.pdfs, [doc.id]: pdf };
                        this.setState({ pdfs });
                        return true;
                    })
                    .catch(console.log);
            }
        });
    }

    render() {
        return (
            <div className="document-list clearfix">
                { this.props.documents.map((doc, index) => 
                    <DocumentView key={index} document={doc} pdf={this.state.pdfs[doc.id]} removeDocument={() => this.props.removeDocument(doc.id)} />)
                }
            </div>
        );
    }
}