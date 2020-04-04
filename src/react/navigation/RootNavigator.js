import { createSwitchNavigator } from 'react-navigation';

import { Login, Signup, Start } from '../auth';
import MainNavigator from './MainNavigator';
import OnboardingNavigator from './OnboardingNavigator';

const RootNavigator  = createSwitchNavigator(
    {
        Main: MainNavigator,
        Onboarding: OnboardingNavigator,
        Start,
        Login,
    },
    {

    }
);

export default RootNavigator;