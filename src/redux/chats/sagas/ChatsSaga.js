import { all, apply, call, put, takeEvery, fork, select, take, takeLeading } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import * as ActionTypes from '../../ActionTypes';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';

function* watchListenChatsRequested() {
    yield takeLeading(ActionTypes.LISTEN_CHATS.REQUEST,
        function* onListenChatsRequested(action) {

            const chatsChannel = eventChannel(
                emit => {
                    return firestore().collection('chats').where('uids', 'array-contains', auth().currentUser.uid).onSnapshot(emit)
                }
            );

            console.log("REQUEST: Listening for Chats")
            try {
                while (true) {
                    const chatsSnapshot = yield take(chatsChannel);
                    console.log("SUBSCRIPTION: Fired Chats Listener Subscription");
                    let chatsDocsData = chatsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

                    for (const chat of chatsDocsData) {
                        let otherUid = chat.uids.filter(uid => uid != auth().currentUser.uid)[0];
                        yield put({ type: ActionTypes.FETCH_PROFILE.REQUEST, payload: otherUid });
                        yield put({ type: ActionTypes.FETCH_MESSAGES.REQUEST, payload: chat.id });
                    }

                    yield put({ type: ActionTypes.LISTEN_CHATS.SUCCESS });
                    yield put({ type: ActionTypes.FETCH_CHATS.SUCCESS, payload: chatsDocsData });
                }
            }
            catch (e) {
                console.log("ERROR: Chats Sync Error:", e);
                yield put({ type: ActionTypes.LISTEN_CHATS.FAILURE, payload: e });
            }

        }
    );
}

function* watchFetchMessagesRequested() {
    yield takeEvery(ActionTypes.FETCH_MESSAGES.REQUEST,
        function* onFetchMessagesRequested(action) {

            let chatId = action.payload;

            console.log("REQUEST: Fetching Messages for ChatID", chatId);
            try {

                let chatRef = firestore().collection('chats').doc(chatId).collection('messages');
                let messagesSnapshot = yield call([chatRef, chatRef.get]);
                let messagesDocs = messagesSnapshot.docs;
                let messagesData = messagesDocs.map(message => ({ ...message.data(), id: message.id }));

                yield put({ type: ActionTypes.FETCH_MESSAGES.SUCCESS, payload: { chatId, messages: messagesData } });

            }
            catch (e) {
                console.log("ERROR: Couldn't fetch messages", e);
                yield put({ type: ActionTypes.FETCH_MESSAGES.ERROR, payload: e });
            }

        }
    );
}

const chatsWatchers = [
    watchListenChatsRequested,
    watchFetchMessagesRequested,
];

export default function* watchChatsActions() {
    console.log('Chats Actions Watcher Running');
    yield all(
        chatsWatchers.map(watcher => fork(watcher))
    );
}