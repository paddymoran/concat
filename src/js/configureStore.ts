import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from './reducer';
import * as thunk from 'redux-thunk';
import { routerMiddleware } from 'react-router-redux';
import createLogger from 'redux-logger';

const data = {};

export default function configureStore(history, initialState=data) {
    let middleware;
    const loggerMiddleware = createLogger();

    const shouldCall = ({ dispatch, getState }) => {
        return next => action => {
            const shouldCall = action.shouldCall || (() => true);

            if (!shouldCall(getState())) {
                return false;
            }

            return next(action);
        }
    }

    middleware = applyMiddleware(
          <any>thunk,
          loggerMiddleware,
          routerMiddleware(history),
          shouldCall
    );

    const createStoreWithMiddleware = <any>compose(middleware)(createStore);

    return createStoreWithMiddleware(rootReducer, initialState);
}
