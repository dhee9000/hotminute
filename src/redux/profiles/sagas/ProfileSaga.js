import { all, apply, call, put, takeEvery, fork, select } from 'redux-saga/effects';
import * as ActionTypes from '../../ActionTypes';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';

function* watchProfileRequested() {
    yield takeEvery(ActionTypes.FETCH_PROFILE.REQUEST,
        function* onProfileRequested(action) {

            let uid = action.payload;

            let profile = yield select(state => state.profiles[uid]);
            if (profile && profile.loaded) {
                return;
            }

            try {

                let profileRef = firestore().collection('profiles').doc(uid);
                let profileSnapshot = yield call([profileRef, profileRef.get]);

                if (profileSnapshot.exists) {
                    console.log("Fetching Profile with UID: " + uid);
                    let profileData = profileSnapshot.data();
                    yield call([Promise, Promise.all], Object.keys(profileData.images).map((key) => {
                        let pictureRef = storage().ref(profileData.images[key].ref);
                        let picturePromise = pictureRef.getDownloadURL().then(pictureUrl => {
                            profileData = { ...profileData, images: { ...profileData.images, [key]: { ...profileData.images[key], url: pictureUrl } } };
                        });
                        return picturePromise;
                    }));
                    yield put({ type: ActionTypes.FETCH_PROFILE.SUCCESS, payload: { ...profileData, id: profileSnapshot.id } });
                }

            }
            catch (e) {
                console.log("Profile Fetch Error:", e);
                yield put({ type: ActionTypes.FETCH_PROFILE.FAILURE, payload: uid });
            }

        }
    );
}

const profileWatchers = [
    watchProfileRequested,
];

export default function* watchProfileActions() {
    console.log('Profile Actions Watcher Running');
    yield all(
        profileWatchers.map(watcher => fork(watcher))
    );
}