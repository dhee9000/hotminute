import { combineReducers } from 'redux';
import * as ActionTypes from '../../ActionTypes';

const allIds = (state = [], action) => {
    switch (action.type) {

        case ActionTypes.FETCH_MESSAGE.SUCCESS: {

            let { id } = action.payload;

            if (!state.includes(id)) {
                return (
                    [
                        ...state,
                        id
                    ]
                );
            }
            else{
                return state;
            }
            break;
        }

        default: {
            return state;
            break;
        }

    }
}

const byId = (state = {}, action) => {
    switch (action.type) {

        case ActionTypes.FETCH_MESSAGE.SUCCESS: {

            let { id, sentAt, sentBy, text } = action.payload;

            return (
                {
                    ...state,
                    [id]: {
                        sentAt,
                        sentBy,
                        text,
                    }
                }
            );
            break;
        }


        default: {
            return state;
            break;
        }
    }
}

MessagesReducer = combineReducers({ allIds, byId });

export default MessagesReducer;