import { all, spawn } from 'redux-saga/effects';
import { ProfileSaga } from './profiles/sagas';
import { MatchesSaga } from './matches/sagas';
import { ChatsSaga } from './chats/sagas';
import { FiltersSaga } from './filters/sagas';

const allWatcherSagas = [
    ProfileSaga,
    MatchesSaga,
    ChatsSaga,
    FiltersSaga,
];

export default function* rootSaga() {
    yield all(
        allWatcherSagas.map(saga => spawn(saga))
    );
}