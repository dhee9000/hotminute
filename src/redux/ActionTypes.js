const action = actionName => (
    {
        REQUEST: actionName + '_REQUEST',
        SUCCESS: actionName + '_SUCCESS',
        FAILURE: actionName + '_FAILURE'
    }
);

// Auth Actions

/**
 * Action Name: Fetch Profile
 * Action Description: Fetches a single profile using the uid passed as the actions payload uid. If the payloads force parameter
 *  is set to true, it will fetch the profile even if it is already in the state store.
 */
export const FETCH_PROFILE = action('FETCH_PROFILE');
export const UPDATE_PROFILE = action('UPDATE_PROFILE');

/**
 * Action Name: Listen Matches
 * Action Description: Starts listening for changes to the user's matches, will trigger a Fetch Matches action on each update to bulk process all fetched matches.
 * Notes: FETCH_MATCHES is just a version of FETCH_MATCH that triggers a bulk process of all matches at once in the reducer so that multiple UI updates don't occur
 *  for one round of matches fetched.
 */
export const LISTEN_MATCHES = action('LISTEN_MATCHES');
export const FETCH_MATCHES = action('FETCH_MATCHES');

/**
 * Action Name: Fetch Match
 * Action Description: Fetches a single match using the matchId passed as the actions payload. If the payloads force parameter is set to true, it will
 *  fetch the match even if it is already in the state store.
 * Notes: This action should not be required since any changes to matches and all matches are already loaded by activating the matches listener.
 */
export const FETCH_MATCH = action('FETCH_MATCH');

/**
 * Action Name: Listen Chats
 * Action Description: Starts listening for changes to the user's chats, when a chat updates it will trigger a Fetch Chats so that each update triggers a bulk update
 *  of all chats in the store.
 * Notes: FETCH_CHATS is just a bulk version of FETCH_CHAT
 */

export const LISTEN_CHATS = action('LISTEN_CHATS');
export const FETCH_CHATS = action('FETCH_CHATS');

export const FETCH_MESSAGE = action('FETCH_MESSAGE');
export const FETCH_MESSAGES = action('FETCH_MESSAGES');

export const LISTEN_MESSAGES = action('LISTEN_MESSAGES');

/**
 * Action Name: Fetch Chat
 * Action Description: Fetches a single chat. Analogous to FETCH MATCH and FETCH MATCHES
 */
export const FETCH_CHAT = action('FETCH_CHAT');


/**
 * Action Name: Fetch Filters
 * Action Description: Fetch Filters is used to fetch the users matching filters. These can be updated using UPDATE FILTER, UPDATE FILTER should trigger a fetch filter
 *  or update the local filter state on completion to ensure sync between the server version and local version of filters since call filters are client authoritative.
 */
export const FETCH_FILTERS = action('FETCH_FILTERS');
export const UPDATE_FILTER = action('UPDATE_FILTER');