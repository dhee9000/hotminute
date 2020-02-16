import { createSwitchNavigator } from 'react-navigation';

import { Login, Signup, Start } from '../auth';
import MainNavigator from './MainNavigator';

const RootNavigator  = createSwitchNavigator(
    {
        Start,
        Login,
        Signup,
        Main: MainNavigator
    },
    {

    }
);

export default RootNavigator;