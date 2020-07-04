import { combineReducers } from "redux";
import { ProfilesReducer } from './profiles/reducers';
import { MatchesReducer } from './matches/reducers';
import { ChatsReducer } from './chats/reducers';
import { FiltersReducer } from './filters/reducers';

const Reducers = combineReducers({
    __default: (state={}, action) => ({}),
    profiles: ProfilesReducer,
    matches: MatchesReducer,
    chats: ChatsReducer,
    filters: FiltersReducer,
})

export default Reducers;