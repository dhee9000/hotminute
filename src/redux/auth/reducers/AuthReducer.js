import { combineReducers } from 'redux';
import * as ActionTypes from '../../ActionTypes';
import * as States from '../../States';

console.log(ActionTypes);
console.log(States);

const AuthReducer = (state={status: States.INITIALIZING}, action) => {
    switch(action.type){
        case ActionTypes.AUTHENTICATE_USER, ActionTypes.CODE_VERIFICATION.SUCCESS: {
            let currentUser = action.payload;
            return {status: States.AUTHENTICATED, user: currentUser};
        }
        case ActionTypes.CREATE_ACCOUNT.REQUESTED: {
            return {status: States.CREATING_ACCOUNT};
        }
        case ActionTypes.CREATE_ACCOUNT.SUCCESS: {
            return {status: States.CODE_SENT};
        }
        default: {
            return state;
        }
    }
};

export default AuthReducer;