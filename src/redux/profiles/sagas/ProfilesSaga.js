import { all, apply, call, put, takeEvery, fork, select, takeLatest } from 'redux-saga/effects';
import * as ActionTypes from '../../ActionTypes';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';

function* watchProfileRequested() {
    yield takeEvery(ActionTypes.FETCH_PROFILE.REQUEST,
        function* onProfileRequested(action) {

            try {

                let uid = null;
                let force = false;
                if (action.payload.uid) {
                    uid = action.payload.uid;
                }
                else {
                    uid = action.payload;
                }
                if (action.payload.force) {
                    force = action.payload.force;
                }

                console.log("REQUEST: Requested Profile with UID: " + uid);

                let profile = yield select(state => state.profiles[uid]);
                if ((profile && profile.loaded && !force) || (profile && profile.loading)) {
                    console.log("CACHE: Profile with UID already" + profile.loaded ? " loaded: " : " loading: " + uid);
                    return;
                }


                let profileRef = firestore().collection('profiles').doc(uid);
                let profileSnapshot = yield call([profileRef, profileRef.get]);

                if (profileSnapshot.exists) {
                    console.log("FETCH: Fetching Profile with UID: " + uid);
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

function* watchUpdateProfileRequested() {
    yield takeLatest(ActionTypes.UPDATE_PROFILE.REQUEST,
        function* onUpdateProfileRequested(action) {
            let profileDocRef = firestore().collection('profiles').doc(auth().currentUser.uid);
            let newProfileData = {
                fname: action.payload.fname,
                lname: action.payload.lname,
                occupation: action.payload.occupation,
                bio: action.payload.bio,
                interests: action.payload.interests,
            }
            try {
                yield call([profileDocRef, profileDocRef.update], newProfileData);
                yield put({ type: ActionTypes.UPDATE_PROFILE, payload: action.payload.updateId });
            }
            catch (e) {
                console.log("Profile Update Error: ", e);
                yield put({ type: ActionTypes.UPDATE_PROFILE.FAILURE, payload: e });
            }
        }
    );
}

const profileWatchers = [
    watchProfileRequested,
    watchUpdateProfileRequested,
];

export default function* watchProfileActions() {
    console.log('Profile Actions Watcher Running');
    yield all(
        profileWatchers.map(watcher => fork(watcher))
    );
}