import { all, spawn } from 'redux-saga/effects';

const allWatcherSagas = [
    
];

export default function* rootSaga() {
    yield all(
        allWatcherSagas.map(saga => spawn(saga))
    );
}