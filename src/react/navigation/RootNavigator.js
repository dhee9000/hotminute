import { createSwitchNavigator } from 'react-navigation';

import { Splash, DatingPeriodInfo, LocationInfo } from '../splash';
import { Login, Signup, Start } from '../auth';
import MainNavigator from './MainNavigator';
import OnboardingNavigator from './OnboardingNavigator';

const RootNavigator  = createSwitchNavigator(
    {
        Splash,
        DatingPeriodInfo,
        LocationInfo,
        Start,
        Login,
        Onboarding: OnboardingNavigator,
        Main: MainNavigator,
    },
    {
        
    }
);

export default RootNavigator;