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
    hash: string;
}

class UnconnectedVerify extends React.PureComponent<VerifyDocumentsProps, {showing: Showing[]}> {
    _fileInput: HTMLInputElement;

    constructor(props: VerifyDocumentsProps) {
        super(props);
        this.fileDrop = this.fileDrop.bind(this);
        this.collectFiles = this.collectFiles.bind(this);
        this.state = {showing: []}
    }


    fileDrop(files: File[]) {
        const filenames = files.map(f => f.name);
        Promise.all(files.map(readAsArrayBuffer))
            .then((buffers) => {
                const hashes = buffers.map(file => shajs('sha256').update(file).digest('hex'));
                this.setState({showing: hashes.map((h, i) => ({hash: h, filename: filenames[i]}))});
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
        return <div className="row">
            <div className="verifications col-md-6 col-md-offset-3">
            { this.state.showing.map((showing: Showing, i: number) => {
                const result = this.props.verifications[showing.hash];
                const loaded = result && result.status === Sign.DownloadStatus.Complete;
                return <div key={i} className="verification">
                    <div className="filename">{ showing.filename }</div>
                    { !loaded && <div className="text-warning">Loading</div> }
                    { loaded && (!result.users || !result.users.length) &&  <div className="text-danger">No Records Found </div> }
                    { loaded && (result.users && result.users.length) &&  <div>
                            { result.users.map((user, i: number) => {
                                return <div key={i}  className="text-success">Signed by { user.name } ({ user.email })</div>
                            }) }

                    </div> }
                </div>
            }) }

        </div>
        </div>
    }

    render() {
        return (
            <FileDropZone onDrop={this.fileDrop}>
                <div>
                <div className='page-heading'>
                <h1 className="title question">Select Documents to Verify</h1>
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
    {
        requestVerification
    }
)(UnconnectedVerify);


export default Verify;

