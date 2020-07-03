import { all, spawn } from 'redux-saga/effects';
import { ProfileSaga } from './profiles/sagas';
import { MatchesSaga } from './matches/sagas';
import { ChatsSaga } from './chats/sagas';

const allWatcherSagas = [
    ProfileSaga,
    MatchesSaga,
    ChatsSaga,
];

export default function* rootSaga() {
    yield all(
        allWatcherSagas.map(saga => spawn(saga))
    );
}