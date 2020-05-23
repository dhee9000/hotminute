import react from 'react';
import {View} from 'react-native';
import {Font} from 'expo';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import {ApolloProvider, Query} from 'react-apollo';
import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag';
import {ProfileScreen} from './ProfileScreen';
import {Matches} from './matches/Matches';

const client = new ApolloClient({uri: 'https://apitest.hotminute.app/graphql'})

const profile = gql`
query profile{
    Profile{
        id
        fname
        lname
        dob
        occupation
        bio
        gender
        images{
            order
            image
        }

    }
}`

const MainNavigator = createStackNavigator({
    Matches: {screen: Matches},
    ProfileScreen: {screen: ProfileScreen},
}, {headerMode: 'none'});

const AppContainer = createAppContainer(MainNavigator);

export const AppContext = React.createContext({data: {Profile}});

export default class ProfileApp extends React.Component {
    constructor{
        super(props);
        this.state = {
            isFontLoaded: false
        };
    }
    async componentDidMount(){
        await Font.loadAsync({
            'maven-pro-regular': require('./assets/MavenPro-Regular.ttf'),
            'maven-pro-bold': require('./assets/MavenPro-Bold.ttf')
        });
        this.setState({isFontLoaded: true});
    }

    render(){
        return(
            <ApolloProvider client={client}>
                <Query query={profile}>
                    {({loading, error, data}) => {
                        if(loading || error)return <View />
                        return <AppContainer.Provider value={data.Profile} style={{flex: 1}}>
                            {this.state.isFontLoaded ? <AppContainer />: <View />}
                            </AppContainer.Provider>

                    }}
                    </Query>
                    </ApolloProvider>
        );
    }
}