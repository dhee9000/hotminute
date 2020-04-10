const state = stateName => (
    {
        REQUESTED: stateName + '_REQUESTED', 
        COMPLETED: stateName + '_COMPLETED', 
        FAILED: stateName + '_FAILED'
    }
);

// Auth States
export const INITIALIZING = 'INITIALIZING';

export const CODE_SEND = state('CODE_SEND');
export const CODE_VERIFY = state('CODE_VERIFY');
export const PROFILE_NOT_SETUP = 'PROFILE_MISSING';

export const AUTHENTICATED = 'AUTHENTICATED'

