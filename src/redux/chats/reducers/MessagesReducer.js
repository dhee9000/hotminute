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
            else {
                return state;
            }
            break;
        }

        case ActionTypes.FETCH_MESSAGES.SUCCESS: {

            let newState = state;
            action.payload.messages.map(message => {
                if (!newState.includes(message.id)) {
                    newState.push(message.id);
                }
            });
            return newState;
            break;


        }

        case ActionTypes.MESSAGE_SENT: {

            let message = action.payload.message;
            let newState = state;

            let { id, sentAt, sentBy, text } = message;
            newState.push(id);

            return newState;

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
                        id,
                        sentAt,
                        sentBy,
                        text,
                    }
                }
            );
            break;
        }

        case ActionTypes.FETCH_MESSAGES.SUCCESS: {

            let messages = action.payload.messages;
            let newState = state;

            messages.map(message => {
                let { id, sentAt, sentBy, text } = message;
                newState[id] = {
                    id,
                    sentAt,
                    sentBy,
                    text,
                }
            });

            return newState;

        }

        case ActionTypes.MESSAGE_SENT: {

            let message = action.payload.message;
            let newState = state;

            let { id, sentAt, sentBy, text } = message;
            newState[id] = { id, sentAt, sentBy, text };

            return newState;

        }


        default: {
            return state;
            break;
        }
    }
}

MessagesReducer = combineReducers({ allIds, byId });

export default MessagesReducer;