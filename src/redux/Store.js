import {createStore, applyMiddleware, compose} from 'redux';

import reducers from './Reducers';
import createSagaMiddleWare from 'redux-saga';

import rootSaga from './Sagas';

const composeEnhancers =
	typeof window === 'object' &&
	window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
		window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;



export default function createReduxStore(){
	const saga = createSagaMiddleWare();
	const store = createStore(reducers, composeEnhancers(applyMiddleware(saga)));
	saga.run(rootSaga);
	return store;
}