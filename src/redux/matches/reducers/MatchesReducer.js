import { combineReducers } from 'redux';
import * as ActionTypes from '../../ActionTypes';

const allIds = (state = [], action = {}) => {
    switch (action.type) {
        case ActionTypes.FETCH_MATCH.REQUEST: {

            let id = action.payload;
            if (!state.includes(id)) {
                state.push(id);
            }

        }
        default: {
            return state;
        }
    }
}

const byId = (state = {}, action = {}) => {
    switch (action.type) {
        case ActionTypes.FETCH_MATCH.REQUEST: {

            let id = action.payload;
            if (!state[id]) {
                return {
                    ...state,
                    [id]: {
                        loaded: false,
                        loading: true,
                        error: false,
                    }
                }
            }

        }
        
        case ActionTypes.FETCH_MATCH.SUCCESS: {

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