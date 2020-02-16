import { createMaterialTopTabNavigator } from 'react-navigation-tabs';

import { Matching } from '../matching';
import { Profile } from '../profile';
import { Chat } from '../chat';

const MainNavigator = createMaterialTopTabNavigator(
    {
        Matching,
        Profile,
        Chat,
    },
    {

    }
)

export default MainNavigator;