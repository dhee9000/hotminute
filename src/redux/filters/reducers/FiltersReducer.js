import { combineReducers } from 'redux';
import * as ActionTypes from '../../ActionTypes';

const defaultFilters = {
    maxDistance: 100,
    minAge: 18,
    maxAge: 24,
    genders: {
        male: true,
        female: true,
        other: true
    }
}

const FiltersReducer = (state = defaultFilters, action = {}) => {
    switch (action.type) {
        case ActionTypes.FETCH_FILTERS.REQUEST: {

            if(!state.loaded){
                return {
                    loading: true,
                    loaded: false,
                    error: false,
                }
            }
            else{
                return state;
            }            
            break;
        }
        case ActionTypes.FETCH_FILTERS.SUCCESS: {
            let f = action.payload;
            return {
                maxDistance: f.maxDistance,
                minAge: f.minAge,
                maxAge: f.maxAge,
                genders: f.genders,
                loading: false,
                loaded: true,
                error: false,
            }
            break;
        }
        default: {
            return state;
        }
    }
}

export default FiltersReducer;