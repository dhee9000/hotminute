import { createSwitchNavigator } from 'react-navigation';

import { Login, Signup, Start } from '../auth';
import MainNavigator from './MainNavigator';

const RootNavigator  = createSwitchNavigator(
    {
        Main: MainNavigator,
        Start,
        Login,
        Signup,
    },
    {

    }
);

export default RootNavigator;