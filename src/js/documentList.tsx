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
        <PDFThumbnail pdf={props.pdf} width={200} />
        <div className="filename">{ props.document.filename }</div>
        
        <ReactCSSTransitionGroup transitionName="progress" transitionEnterTimeout={300} transitionLeaveTimeout={500}>
            { props.document.status === Sign.DocumentUploadStatus.InProgress &&
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

export default class DocumentList extends React.Component<DocumentListProps, {pdfs: PDFDocumentDictionary}> {
    constructor(props: DocumentListProps) {
        super(props);

        this.state = {
            pdfs: {}
        };
    }

    componentDidMount() {
        this.readPdfsToState(this.props.documents);
    }
    
    componentWillReceiveProps(props: DocumentListProps) {
        this.readPdfsToState(props.documents);
    }

    readPdfsToState(documents: Sign.Document[]) {
        documents.map(doc => {
            if (doc.id && !this.state.pdfs[doc.id] && doc.status === Sign.DocumentUploadStatus.Complete) {
                this.props.getPDF(doc.id)
                    .then((pdf: PDFDocumentProxy) => {
                        const pdfs = { ...this.state.pdfs, [doc.id]: pdf };
                        this.setState({ pdfs });

                        console.log('done loading PDF: ' + doc.id);
                        console.log(this.state.pdfs);

                        return true;
                    })
                    .catch(error => { 
                        console.log('Fuck!');
                        console.log(error);
                    });
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