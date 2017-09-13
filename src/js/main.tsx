"use strict";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Root from "./root";
import configureStore from './configureStore';
import { browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { formatUsage, formatUser } from './utils'

let data : any = {};

try{
    const input : any = JSON.parse(document.getElementById("data").textContent)
    if(input.usage){
        data.usage = formatUsage(input.usage)
    }
    if(input.user){
        data.user = formatUser(input.user)
    }

}catch(e){
    //do nothing
}

const store = configureStore(browserHistory, data);
const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
     <Root store={store} history={history} />,
    document.getElementById('main')
);

