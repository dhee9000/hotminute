import { combineReducers } from "redux";
import { ProfilesReducer } from './profiles/reducers';

const Reducers = combineReducers({
    __default: (state={}, action) => ({}),
    profiles: ProfilesReducer,
})

export default Reducers;