const action = actionName => (
    {
        REQUESTED: actionName + '_REQUESTED', 
        SUCCESS: actionName + '_SUCCESS', 
        FAILURE: actionName + '_FAILURE'
    }
);

export const GET_NEARBY_ALL = action('GET_NEARBY_ALL');
