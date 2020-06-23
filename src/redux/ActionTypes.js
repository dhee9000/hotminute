const action = actionName => (
    {
        REQUEST: actionName + '_REQUEST', 
        SUCCESS: actionName + '_SUCCESS', 
        FAILURE: actionName + '_FAILURE'
    }
);

// Auth Actions
export const FETCH_PROFILE = action('FETCH_PROFILE');