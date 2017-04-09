import { createStore, applyMiddleware, compose, MiddlewareAPI, Dispatch } from 'redux';
import rootReducer from './reducer';
import * as thunk from 'redux-thunk';
import { routerMiddleware } from 'react-router-redux';
import { createLogger } from 'redux-logger';
import { History } from 'history';

const data = {};

export default function configureStore(history: History, initialState=data) {
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

    const middleware = applyMiddleware(
          <any>thunk,
          loggerMiddleware,
          routerMiddleware(history),
          shouldCall
    );

    const createStoreWithMiddleware = compose(middleware)(createStore);

    return createStoreWithMiddleware(rootReducer, initialState);
}
