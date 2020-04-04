import {  createSwitchNavigator } from 'react-navigation';

import { CreateAccount } from '../onboarding';
import { VerifyPhoneNumber } from '../onboarding';
import { GetPermissions } from '../onboarding';
import { CreateProfileBio } from '../onboarding';
import { CreateProfileMedia } from '../onboarding';
import { SelectPreferences } from '../onboarding';

const OnboardingNavigator = createSwitchNavigator(
    {
        CreateAccount,
        VerifyPhoneNumber,
        GetPermissions,
        CreateProfileBio,
        CreateProfileMedia,
        SelectPreferences,
    },
    {

    }
)

export default OnboardingNavigator;