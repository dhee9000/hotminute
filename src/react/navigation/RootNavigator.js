import { createSwitchNavigator } from 'react-navigation';

import { Login, Signup, Start } from '../auth';
import MainNavigator from './MainNavigator';
import OnboardingNavigator from './OnboardingNavigator';

const RootNavigator  = createSwitchNavigator(
    {
        Start,
        Login,
        Onboarding: OnboardingNavigator,
        Main: MainNavigator,
    },
    {

    }
);

export default RootNavigator;