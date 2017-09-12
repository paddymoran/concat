import * as React from 'react';
import { connect } from 'react-redux';
import FileDropZone from './fileDropZone';
import { requestVerification} from '../actions';
import { push } from 'react-router-redux';
import * as shajs from 'sha.js';


function readAsArrayBuffer(file: File) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = function(){

            resolve(new Int8Array(reader.result))
        };
        reader.readAsArrayBuffer(file);
    })
}

interface VerifyDocumentsProps {
    verifications: Sign.Verifications;
    requestVerification: (payload: Sign.Actions.RequestVerificationPayload) => void;
}

interface Showing {
    filename: string;
    hash?: string;
}

interface DocumentVerityProps {
    loading: boolean;
    filename: string;
    verified: boolean;
    users?: Sign.User[];
}

class VerifiedIcon extends React.PureComponent {
    render() {
        return (
            <span className="verification-icon fa fa-stack fa-lg verify-heading-icon">
                <i className="fa fa-certificate fa-stack-2x text-success" />
                <i className="fa fa-check fa-stack-1x fa-inverse" />
            </span>
        );
    }
}

class UnverifiedIcon extends React.PureComponent {
    render() {
        return (
            <span className="verification-icon fa fa-stack fa-lg">
                <i className="fa fa-certificate fa-stack-2x text-danger" />
                <i className="fa fa-close fa-stack-1x fa-inverse" />
            </span>
        )
    }
}

class DocumentVerity extends React.PureComponent<DocumentVerityProps> {
    render() {
        if (this.props.loading) {
            return (
                <div className="verification">
                    <span className="verification-icon fa fa-stack fa-lg verify-heading-icon">
                        <i className="fa fa-certificate fa-stack-2x" style={{ color: "#555" }} />
                        <i className="fa fa-refresh fa-spin fa-fw fa-stack-1x fa-inverse" />
                    </span>
                    <div>
                        <div className="filename">{ this.props.filename }</div>
                        <div>Loading...</div>
                    </div>
                </div>
            );
        }

        if (this.props.verified) {
            return (
                <div className="verification">
                    <VerifiedIcon />
                    <div>
                        <div className="filename">{ this.props.filename }</div>
                        <div>
                            {this.props.users.map((user, index) => <div key={index} className="text-success">Signed by {user.name} ({user.email})</div>)}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="verification">
                <UnverifiedIcon />
                <div className="filename">{ this.props.filename }</div>
                <div className="text-danger">No Records Found</div>
            </div>
        );
    }
}

class UnconnectedVerify extends React.PureComponent<VerifyDocumentsProps, {showing: Showing[]}> {
    _fileInput: HTMLInputElement;

    constructor(props: VerifyDocumentsProps) {
        super(props);
        this.fileDrop = this.fileDrop.bind(this);
        this.collectFiles = this.collectFiles.bind(this);
        this.onClick = this.onClick.bind(this);
        this.state = {showing: []};
    }


    fileDrop(files: File[]) {
        const oldShowing = this.state.showing;

        const fileInfo: Showing[] = files.map(f => ({filename: f.name, hash: null}));

        this.setState({
            showing: [
                ...oldShowing,
                ...fileInfo
            ]
        })

        Promise.all(files.map(readAsArrayBuffer))
            .then((buffers) => {
                const hashes = buffers.map(file => shajs('sha256').update(file).digest('hex'));
                this.setState({
                    showing: [
                        ...oldShowing,
                        ...hashes.map((h, i) => ({hash: h, filename: fileInfo[i].filename}))
                    ]
                });
                hashes.map(hash => this.props.requestVerification({hash}))
            })
    }

    collectFiles(event: React.ChangeEvent<HTMLInputElement>) {
       this.fileDrop([].filter.call(event.target.files, (f: File) => f.type === 'application/pdf'));
    }

    onClick() {
        if (this._fileInput) {
            this._fileInput.value = null;
            this._fileInput.click();
        }
    }

    summaries() {
        return (
            <div className="row">
                <div className="verifications col-md-10 col-md-offset-1">
                    {this.state.showing.map((showing, index) => {
                        const result = this.props.verifications[showing.hash];
                        const loading = result === undefined ? true : result.status !== Sign.DownloadStatus.Complete;

                        const users = loading ? null : result.users;
                        const verified = users ? users.length > 0 : false;

                        return <DocumentVerity key={index} loading={loading} verified={verified} filename={showing.filename} users={users} />
                    })}
                </div>
            </div>
        )
    }

    render() {
        return (
            <FileDropZone onDrop={this.fileDrop}>
                <div>
                    <div className='page-heading'>
                        <h1 className="title question">
                            <VerifiedIcon />
                            Verify Signed Documents
                        </h1>
                    </div>

                    <div className="explanation fake-drop-zone" onClick={this.onClick}>
                        <span className="drag-instruction">Drag PDFs here, or click to select</span>
                        <span className="drop-instruction">DROP HERE</span>
                        <input type="file" multiple name="files" style={{display: 'none'}} ref={(el) => this._fileInput = el} onChange={this.collectFiles}/>
                    </div>
                </div>
                { this.summaries() }
            </FileDropZone>
        );
    }
}


const Verify = connect(
    (state: Sign.State, ownProps: VerifyDocumentsProps) => ({
        verifications: state.verifications
    }),
    { requestVerification }
)(UnconnectedVerify);


export default Verify;

