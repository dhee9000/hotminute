const action = actionName => (
    {
        REQUEST: actionName + '_REQUEST', 
        SUCCESS: actionName + '_SUCCESS', 
        FAILURE: actionName + '_FAILURE'
    }
);

// Auth Actions
export const SEND_CODE = action('SEND_CODE');
export const VERIFY_CODE = action('VERIFY_CODE');