import { combineReducers } from 'redux';
import * as ActionTypes from '../../ActionTypes';

const allIds = (state = [], action = {}) => {
    switch (action.type) {
        case ActionTypes.FETCH_MATCH.REQUEST: {

            let newState = [...state];

            let id = action.payload;
            if (!newState.includes(id)) {
                newState.push(id);
            }

            return newState;

        }
        case ActionTypes.FETCH_MATCHES.SUCCESS: {

            let newState = [...state];

            let docs = action.payload;
            docs.forEach(doc => {
                if(!newState.includes(doc.id)){
                    newState.push(doc.id);
                }
            });
            
            return newState;

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

        case ActionTypes.FETCH_MATCHES.SUCCESS: {

            let newState = {...state};

            let docs = action.payload;
            docs.forEach(doc => {
                newState[doc.id] = {
                    loaded: true,
                    loading: false,
                    error: false,
                    ...doc,
                }
            });
            
            return newState;

        }

        default: {
            return state;
        }
    }
}

const MatchesReducer = combineReducers({allIds, byId});

export default MatchesReducer;