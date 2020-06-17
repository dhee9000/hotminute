import { all, spawn } from 'redux-saga/effects';
import { AuthSaga } from './auth/sagas';

const allWatcherSagas = [
    AuthSaga,
];

export default function* rootSaga() {
    yield all(
        allWatcherSagas.map(saga => spawn(saga))
    );
}