import {  createSwitchNavigator } from 'react-navigation';

import { CreateAccount } from '../onboarding';
import { VerifyPhoneNumber } from '../onboarding';

import { CreateProfileName } from '../onboarding';
import { CreateProfileDob } from '../onboarding';
import { CreateProfileGender } from '../onboarding';
import { CreateProfileOccupation } from '../onboarding';
import { CreateProfileBio } from '../onboarding';
import { CreateProfileInterests } from '../onboarding';
import { CreateProfileMedia } from '../onboarding';

import { SelectPreferencesDistance } from '../onboarding';
import { SelectPreferencesGender } from '../onboarding';
import { SelectPreferencesAge } from '../onboarding';
import { SelectPreferencesHeight } from '../onboarding';

import { GetPermissions } from '../onboarding';

const OnboardingNavigator = createSwitchNavigator(
    {
        GetPermissions,
        CreateProfileName,
        CreateProfileDob,
        CreateProfileGender,
        CreateProfileOccupation,
        CreateProfileBio,
        CreateProfileInterests,
        CreateProfileMedia,
        SelectPreferencesDistance,
        SelectPreferencesGender,
        SelectPreferencesAge,
        SelectPreferencesHeight,
    },
    {

    }
)

export default OnboardingNavigator;