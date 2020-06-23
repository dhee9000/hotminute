import { all, spawn } from 'redux-saga/effects';
import { ProfileSaga } from './profiles/sagas';

const allWatcherSagas = [
    ProfileSaga,
];

export default function* rootSaga() {
    yield all(
        allWatcherSagas.map(saga => spawn(saga))
    );
}