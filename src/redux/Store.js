import {createStore, applyMiddleware, compose} from 'redux';

import reducers from './Reducers';
import rootSaga from './Sagas';

import createSagaMiddleWare from 'redux-saga';

// Check if React DevTools Present, connect Redux Inspector
const composeEnhancers =
	typeof window === 'object' &&
	window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
		window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;

// Create Redux Store, apply saga middleware, run root saga
export default function createReduxStore(){
	const saga = createSagaMiddleWare();
	const store = createStore(reducers, composeEnhancers(applyMiddleware(saga)));
	saga.run(rootSaga);
	return store;
}