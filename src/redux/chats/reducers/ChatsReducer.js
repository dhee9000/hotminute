import { combineReducers } from 'redux';
import * as ActionTypes from '../../ActionTypes';
import messages from './MessagesReducer';

const allIds = (state = [], action = {}) => {
    switch (action.type) {
        case ActionTypes.FETCH_CHAT.REQUEST: {

            let newState = [...state];

            let id = action.payload;
            if (!newState.includes(id)) {
                newState.push(id);
            }

            return newState;

        }
        case ActionTypes.FETCH_CHATS.SUCCESS: {

            let newState = [...state];

            let docs = action.payload;
            docs.forEach(doc => {
                if(!newState.includes(doc.id)){
                    newState.push(doc.id);
                }
            });
            
            return newState;

        }
        default: {
            return state;
        }
    }
}

const byId = (state = {}, action = {}) => {
    switch (action.type) {
        case ActionTypes.FETCH_CHAT.REQUEST: {

            let id = action.payload;
            if (!state[id]) {
                return {
                    ...state,
                    [id]: {
                        loaded: false,
                        loading: true,
                        error: false,
                        messages: messages(state[id] ? state[id].messages : undefined, action),
                    }
                }
            }

        }
        
        case ActionTypes.FETCH_CHAT.SUCCESS: {

            let doc = action.payload;

            return {
                ...state,
                [doc.id]: {
                    loaded: true,
                    loading: false,
                    error: false,
                    ...doc,
                    messages: messages(state[doc.id] ? state[doc.id].messages : undefined, action),
                }
            }
        }

        case ActionTypes.FETCH_CHATS.SUCCESS: {

            let newState = {...state};

            let docs = action.payload;
            docs.forEach(doc => {
                newState[doc.id] = {
                    loaded: true,
                    loading: false,
                    error: false,
                    ...doc,
                    messages: messages(state[doc.id] ? state[doc.id].messages : undefined, action),
                }
            });
            
            return newState;

        }

        case ActionTypes.FETCH_MESSAGE.SUCCESS, ActionTypes.FETCH_MESSAGES.SUCCESS: {

            let { id, chatId } = action.payload;

            return {
                ...state,
                [chatId]: {
                    ...state[chatId],
                    messages: messages(state[chatId].messages, action),
                }
            }
        }


        default: {
            return state;
        }
    }
}

const ChatsReducer = combineReducers({allIds, byId});

export default ChatsReducer;