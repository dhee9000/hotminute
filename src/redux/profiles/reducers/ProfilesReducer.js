import { combineReducers } from 'redux';
import * as ActionTypes from '../../ActionTypes';

const allIds = (state = [], action = {}) => {
    switch (action.type) {
        case ActionTypes.FETCH_PROFILE.REQUEST: {

            let newState = [...state];

            let uid = action.payload;
            if (!newState.includes(uid)) {
                newState.push(uid);
            }
            
            return newState;

        }
        default: {
            return state;
        }
    }
}

const byId = (state = {}, action = {}) => {
    switch (action.type) {
        case ActionTypes.FETCH_PROFILE.REQUEST: {

            let uid = action.payload;
            if (!state[uid]) {
                return {
                    ...state,
                    [uid]: {
                        loaded: false,
                        loading: true,
                        error: false,
                    }
                }
            }

        }
        
        case ActionTypes.FETCH_PROFILE.SUCCESS: {

            let data = action.payload;

            return {
                ...state,
                [data.id]: {
                    loaded: true,
                    loading: false,
                    error: false,
                    ...data,
                }
            }
        }

        default: {
            return state;
        }
    }
}

const ProfilesReducer = combineReducers({allIds, byId});

export default ProfilesReducer;