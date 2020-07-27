import { combineReducers } from "redux";
import { ProfilesReducer } from './profiles/reducers';
import { MatchesReducer } from './matches/reducers';
import { ChatsReducer } from './chats/reducers';
import { FiltersReducer } from './filters/reducers';

const allReducers = combineReducers({
    __default: (state={}, action) => ({}),
    profiles: ProfilesReducer,
    matches: MatchesReducer,
    chats: ChatsReducer,
    filters: FiltersReducer,
});

const Reducers = (state, action) => {
    if(action.type == '@@RESET'){
        state = undefined;
    }

    return allReducers(state, action);
}

export default Reducers;