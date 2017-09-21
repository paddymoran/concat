import * as React from 'react';
import { connect } from 'react-redux';
import FileDropZone from './fileDropZone';
import DocumentList from './documentList';
import { addDocument, requestDocumentSet, defineRecipients, setInviteSignatories, defineDocumentOrder } from '../actions';
import { generateUUID } from './uuid';
import { push } from 'react-router-redux';
import { InviteForm } from './selectRecipients';
import { Button } from 'react-bootstrap';
import { submit } from 'redux-form';


interface UploadDocumentsProps {
    documentIds: string[];
    addDocument: (payload: Sign.Actions.AddDocumentPayload) => void;
    requestDocumentSet: (documentSetId: string) => void;
    documentSetId: string;
}



class Upload extends React.PureComponent<UploadDocumentsProps, {showWarning: boolean, badCount: number}> {
    _fileInput: HTMLInputElement;

    constructor(props: UploadDocumentsProps) {
        super(props);
        this.fileDrop = this.fileDrop.bind(this);
        this.collectFiles = this.collectFiles.bind(this);
        this.onClick = this.onClick.bind(this);
        this.state = {showWarning: false, badCount: 0}
    }

    componentWillMount() {
        this.props.requestDocumentSet(this.props.documentSetId);
    }

    fileDrop(files: File[]) {
        const badFiles = files.filter(f => f.type !== 'application/pdf');
        if(badFiles.length){
            this.setState({showWarning: true, badCount: badFiles.length});
        }
        else{
            this.setState({showWarning: false});
        }
        files = files.filter(f => f.type === 'application/pdf')
        files.map(file => generateUUID().then(uuid => this.props.addDocument({ documentId: uuid, documentSetId: this.props.documentSetId, filename: file.name, file: file })));
    }

    collectFiles(event: React.ChangeEvent<HTMLInputElement>) {
        const badFiles = [].filter.call(event.target.files, (f: File) => f.type !== 'application/pdf').length;
       if(badFiles.length){
           this.setState({showWarning: true, badCount: badFiles.length});
       }
       else{
           this.setState({showWarning: false});
       }
       this.fileDrop([].filter.call(event.target.files, (f: File) => f.type === 'application/pdf'));
    }

    onClick() {
        if (this._fileInput) {
            this._fileInput.value = null;
            this._fileInput.click();
        }
    }

    render() {
        return (
            <FileDropZone onDrop={this.fileDrop}>
                <div>
                <div className='page-heading'>
                <h1 className="title question">Select Documents to Sign</h1>
                </div>

                <div className="explanation fake-drop-zone" onClick={this.onClick}>
                    <span className="drag-instruction">Drag PDFs here, or click to select</span>
                    <span className="drop-instruction">DROP HERE</span>
                        <input type="file" multiple name="files" style={{display: 'none'}} ref={(el) => this._fileInput = el} onChange={this.collectFiles}/>
                    </div>
                    { this.state.showWarning && <p className="alert alert-danger text-center"> {this.state.badCount } { this.state.badCount > 1  ? 'files' : 'file' } could not be added - Please convert your documents to PDF format to upload. </p> }
                    <DocumentList documentSetId={this.props.documentSetId} showRemove={true}/>
                </div>
            </FileDropZone>
        );
    }
}

export const UploadDocuments = connect(
    (state: Sign.State, ownProps: any) => {
        const { documentSetId } = ownProps;
        const documentSet = state.documentSets[documentSetId];
        return {
            documentIds: documentSet ? documentSet.documentIds : null,
            documentSetId,
        };
    },
    { addDocument,  requestDocumentSet }
)(Upload);



class UnconnectedUploadDocumentsFull extends React.PureComponent<ConnectedUploadDocumentsFullProps> {
    constructor(props: ConnectedUploadDocumentsFullProps){
        super(props);
        this.submit = this.submit.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.toggleInviteSignatories = this.toggleInviteSignatories.bind(this);
    }

    onSubmit(values: { recipients: Sign.Recipients }) {
        this.props.defineRecipients(this.props.documentSetId, values.recipients);
        this.nextPage();
    }

    submit() {
        if (this.props.inviteSignatories) {
            this.props.submit();
        }
        else {
            this.nextPage();
        }
    }

    toggleInviteSignatories() {
        this.props.setInviteSignatories(!this.props.inviteSignatories);
    }

    nextPage(){
        if(this.props.documentIds.length){
            if(this.props.documentIds.length > 1){
                this.props.defineDocumentOrder(this.props.documentSetId, this.props.documentIds)
            }
            this.props.nextPage(this.props.documentSetId, this.props.documentIds[0])
        }
    }

    render() {
        return (
            <div>
                <UploadDocuments {...this.props} />

                <hr />

                <div className="text-center">
                    <Button onClick={this.toggleInviteSignatories}>{this.props.inviteSignatories ? "Don't Invite Signatories" : "Invite Signatories"}</Button>
                </div>

                {this.props.inviteSignatories &&
                    <div>
                        <h3 className="text-center">Signatories</h3>

                        <InviteForm initialValues={{ recipients: [{}] }} onSubmit={this.onSubmit} />
                    </div>
                }

                <hr />

                <div className="text-center">
                    <Button bsStyle="primary" onClick={this.submit} disabled={!this.props.documentIds.length}>Continue</Button>
                </div>
            </div>
        );
    }
}

interface UploadDocumentsFullProps {
    documentSetId: string;
}

interface ConnectedUploadDocumentsFullProps extends UploadDocumentsFullProps{
    documentSetId: string;
    documentIds: string[];
    inviteSignatories: boolean;
    submit: () => void;
    defineRecipients: (documentSetId: string, recipients: Sign.Recipients) => void;
    nextPage: (documentSetId: string, documentId: string) => void;
    defineDocumentOrder: (documentSetId: string, documentIds: string[]) => void;
    setInviteSignatories: (inviteSignatories: boolean) => void;
}

export const UploadDocumentsFull = connect(
    (state: Sign.State, ownProps: UploadDocumentsFullProps) => ({
        inviteSignatories: state.uploadDocuments.inviteSignatories,
        documentIds: (state.documentSets[ownProps.documentSetId]|| {documentIds: []}).documentIds
    }),
    {
        submit: () => submit(Sign.FormName.RECIPIENTS),
        defineRecipients: (documentSetId: string, recipients: Sign.Recipients) =>  defineRecipients({ documentSetId, recipients }),
        nextPage: (documentSetId: string, documentId: string) => push(`/documents/${documentSetId}/${documentId}`),
        defineDocumentOrder: (documentSetId: string, documentIds: string[]) => defineDocumentOrder({documentSetId, documentIds}),
        setInviteSignatories: (inviteSignatories: boolean) => setInviteSignatories({ inviteSignatories })
    }
)(UnconnectedUploadDocumentsFull);

export class UploadDocumentsWithDocumentSetId extends React.PureComponent<{}, {documentSetId: string}>{
    constructor(props: {}){
        super(props);
        this.state = {documentSetId: null}
    }
    componentWillMount(){
        generateUUID()
            .then(id => this.setState({documentSetId: id}))
    }
    render() {
        if(this.state.documentSetId){
            return <UploadDocumentsFull documentSetId={this.state.documentSetId} />
        }
        return false;
    }
}
