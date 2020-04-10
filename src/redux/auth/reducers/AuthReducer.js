import { combineReducers } from 'redux';
import * as ActionTypes from '../../ActionTypes';
import * as States from '../../States';

const AuthReducer = (state={status: States.INITIALIZING}, action) => {
    switch(action.type){
        case ActionTypes.SEND_CODE.REQUEST: {
            return({ status: States.CODE_SEND.REQUESTED });
        }
        case ActionTypes.SEND_CODE.SUCCESS: {
            return ({ status: States.CODE_SEND.COMPLETED, });
        }
        case ActionTypes.SEND_CODE.FAILURE: {
            return ({ status: States.CODE_SEND.FAILED, error: action.payload });
        }
        case ActionTypes.VERIFY_CODE.REQUEST: {
            return ({ status: States.CODE_VERIFY.REQUESTED, });
        }
        case ActionTypes.VERIFY_CODE.SUCCESS: {
            return ({ status: States.CODE_VERIFY.COMPLETED, });
        }
        case ActionTypes.VERIFY_CODE.FAILURE: {
            return ({ status: States.CODE_VERIFY.FAILED, error: action.payload, });
        }
        default: {
            return state;
        }
    }
};

export default AuthReducer;