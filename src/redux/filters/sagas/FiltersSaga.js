import { all, apply, call, put, takeEvery, fork, select, takeLatest } from 'redux-saga/effects';
import * as ActionTypes from '../../ActionTypes';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';

function* watchFiltersRequested() {
    yield takeEvery(ActionTypes.FETCH_FILTERS.REQUEST,
        function* onFiltersRequested(action) {

            console.log("REQUEST: Requested Filters");

            try {

                let filtersRef = firestore().collection('filters').doc(auth().currentUser.uid);
                let filtersSnapshot = yield call([filtersRef, filtersRef.get]);

                if (filtersSnapshot.exists) {
                    let filtersData = filtersSnapshot.data();
                    yield put({ type: ActionTypes.FETCH_FILTERS.SUCCESS, payload: { ...filtersData, id: filtersSnapshot.id } });
                }

            }
            catch (e) {
                console.log("Filters Fetch Error:", e);
                yield put({ type: ActionTypes.FETCH_FILTERS.FAILURE, payload: e });
            }

        }
    );
}

function* watchUpdateFiltersRequested() {
    yield takeLatest(ActionTypes.UPDATE_FILTER.REQUEST,
        function* onUpdateFiltersRequested(action) {

            console.log("REQUEST: Update Filters");
            let filtersDocRef = firestore().collection('filters').doc(auth().currentUser.uid);
            
            let nf = action.payload;
            let filtersToUpdate = {}

            if(nf.maxDistance){
                filtersToUpdate.maxDistance = nf.maxDistance;
            }

            if(nf.minAge){
                filtersToUpdate.minAge = nf.minAge;
            }

            if(nf.maxAge){
                filtersToUpdate.maxAge = nf.maxAge;
            }

            if(nf.genders){
                filtersToUpdate.genders = nf.genders;
            }

            try {
                yield call([filtersDocRef, filtersDocRef.update], filtersToUpdate);
                yield put({ type: ActionTypes.UPDATE_PROFILE, payload: action.payload.updateId });
            }
            catch(e){
                console.log("Filters Update Error: ", e);
                yield put({type: ActionTypes.UPDATE_FILTER.FAILURE, payload: e});
            }
        }
    );
}

const filtersWatchers = [
    watchFiltersRequested,
    watchUpdateFiltersRequested,
];

export default function* watchFiltersActions() {
    console.log('Filters Actions Watcher Running');
    yield all(
        filtersWatchers.map(watcher => fork(watcher))
    );
}