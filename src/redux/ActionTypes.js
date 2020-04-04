const action = actionName => (
    {
        REQUESTED: actionName + '_REQUESTED', 
        SUCCESS: actionName + '_SUCCESS', 
        FAILURE: actionName + '_FAILURE'
    }
);

// Auth Actions
export const AUTHENTICATE_USER = 'AUTHENTICATE_USER';
export const CREATE_ACCOUNT = action('CREATE_ACCOUNT');
export const VERIFICATION_CODE_SENT = 'VERIFICATION_CODE_SENT'
export const CODE_VERIFICATION = action('CODE_VERIFICATION');
