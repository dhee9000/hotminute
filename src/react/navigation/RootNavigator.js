import { createSwitchNavigator } from 'react-navigation';

import { Login, Signup, Start } from '../auth';
import MainNavigator from './MainNavigator';
import OnboardingNavigator from './OnboardingNavigator';

import { GodMode } from '../_godmode';

const RootNavigator  = createSwitchNavigator(
    {
        Start,
        Login,
        GodMode,
        Onboarding: OnboardingNavigator,
        Main: MainNavigator,
    },
    {

    }
);

export default RootNavigator;