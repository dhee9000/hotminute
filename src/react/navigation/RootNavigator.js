import { createSwitchNavigator } from 'react-navigation';

import { Login, Signup, Start } from '../auth';
import MainNavigator from './MainNavigator';
import OnboardingNavigator from './OnboardingNavigator';

const RootNavigator  = createSwitchNavigator(
    {
        Onboarding: OnboardingNavigator,
        Main: MainNavigator,
        Start,
        Login,
    },
    {

    }
);

export default RootNavigator;