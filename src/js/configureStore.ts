import { createStore, applyMiddleware, compose, MiddlewareAPI, Dispatch, Middleware } from 'redux';
import rootReducer from './reducers';
import * as thunk from 'redux-thunk';
import { routerMiddleware } from 'react-router-redux';
import { createLogger } from 'redux-logger';
import { History } from 'history';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './sagas';

export default function configureStore(history: History, initialState={}) {
    const shouldCall = ({ dispatch, getState }:MiddlewareAPI<Sign.State>) => {
        return (next: Dispatch<Sign.State>) => (action: Sign.Action<any>) => {
            const shouldCall = action.shouldCall || (() => true);

            if (!shouldCall(getState())) {
                return false;
            }

            return next(action);
        }
    }

    const loggerMiddleware = createLogger();
    const sagaMiddleware = createSagaMiddleware();

    const middleware = applyMiddleware(
        sagaMiddleware,
        <any>thunk.default,
        loggerMiddleware,
        routerMiddleware(history),
        <Middleware>shouldCall
    );

    const createStoreWithMiddleware = compose(middleware)(createStore);
    const store = createStoreWithMiddleware(rootReducer, initialState);
    
    sagaMiddleware.run(rootSaga);

    return store;
}
