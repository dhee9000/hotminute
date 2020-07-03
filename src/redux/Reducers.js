import { combineReducers } from "redux";
import { ProfilesReducer } from './profiles/reducers';
import { MatchesReducer } from './matches/reducers';
import { ChatsReducer } from './chats/reducers';

const Reducers = combineReducers({
    __default: (state={}, action) => ({}),
    profiles: ProfilesReducer,
    matches: MatchesReducer,
    chats: ChatsReducer,
})

export default Reducers;