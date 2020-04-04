import { combineReducers } from "redux";
import { AuthReducer } from "./auth/reducers";

const Reducers = combineReducers({
    __default: (state={}, action) => ({}),
    auth: AuthReducer,
})

export default Reducers;