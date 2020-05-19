import React, {Component} from 'react';
import{StyleSheet, Text, View, TouchableOpacity, ScrollView, TouchableHighlight, FlatList} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {data} from '../mocks/data';
import {MatchesList, InfoText} from './MatchesList';
import {Chatting} from './Chatting';

const styles = StyleSheet.create({
  topHeader: {
    height: 20,
    backgroundColor: '#de5d83'
  },
  header: {
    height: 60,
    backgroundColor: '#de5d83',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 120,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  title: {
    color: '#fff',
    marginLeft: 20,
    fontWeight: '700',
    fontSize: 16,
    flex:1,
    alignItems: 'flex-start'
  },
  tabsContainer: {
    height: 40,
    backgroundColor: '#de5d83',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'stretch'
  },
  tab: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch'
  },
  onFocusTab: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14
  },
  offFocusTab: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    opacity: 0.6
  },
});

const Header = () => (
  <View style={styles.header}>
    <Text style={styles.title}>Your Chats</Text>
    <Icon name="magnify" style={{ marginRight: 15 }} size={24} color="#fff" />
    <Icon name="dots-vertical" style={{ marginRight: 15 }} size={24} color="#fff" />
  </View>
);

const Tabs = () => (
  <View style={styles.tabsContainer}>
    <TouchableHighlight style={[styles.tab, {borderBottomWidth: 3, borderColor: '#fff'}]}>
      <Text style={styles.onFocusTab}>CHAT</Text>
    </TouchableHighlight>
  </View>
);

export default class ChatApp extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedId: undefined,
      selectedTab: 'CHAT'
    };
    this._selectId = this._selectId.bind(this);
    this._selectTab = this._selectTab.bind(this);
  }

  componentWillMount() {
    this.setState({selectedId: undefined});
  }

  _selectId(selectedId) {
    this.setState({selectedId});
  }

  _selectTab(selectedTab) {
    this.setState({selectedTab})
  }

  render() {
    if (!isNaN(this.state.selectedId)) {
      return <Chatting selectId={this._selectId} selectedId={this.state.selectedId} />;
    }

    return (
      <View style={styles.container}>
        <View style={styles.topHeader} />
        <Header />
        <Tabs />
        <ScrollView bounces={false}>
          {data.map((chatting, i) => <MatchesList key={i} selectId={this._selectId} {...chatting} />)}
          <InfoText />
        </ScrollView>
      </View>
    );

    
  }
}

