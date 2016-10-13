import { createStore, applyMiddleware } from 'redux'
import * as thunk from 'redux-thunk'
import rootReducer from './reducer.ts'
const createLogger = require('redux-logger');

export default function configureStore(initialState) {
    const loggerMiddleware = createLogger();

    return createStore(
        rootReducer,
        initialState,
        applyMiddleware(
            <any>thunk,
            loggerMiddleware
        )
    )
}
