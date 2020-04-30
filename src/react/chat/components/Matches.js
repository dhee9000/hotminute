import React from 'react';

import { View, Text, FlatList, TouchableOpacity, } from 'react-native';
import CardItem from './containers/CardItem';
import Icon from './containers/Icon';
import data from './containers/data';

const Matches = props => {
    return (
        <View>
            <FlatList
                ListHeaderComponent={
                    <View style={styles.top}>
                        <Text style={styles.title}>Matches</Text>
                        <TouchableOpacity>
                            <Text style={styles.icon}>
                                <Icon name='optionsV' />
                            </Text>
                        </TouchableOpacity>
                    </View>
                }
                numColumns={2}
                data={data}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity>
                        <CardItem
                            image={item.image}
                            name={item.name}
                            location={item.location}
                            variant
                        />
                    </TouchableOpacity>
                )}
            />

        </View>
    );
};

export default Matches;

import { StyleSheet, Dimensions } from "react-native";

const PRIMARY_COLOR = "#7444C0";
const SECONDARY_COLOR = "#5636B8";
const WHITE = "#FFFFFF";
const GRAY = "#757E90";
const DARK_GRAY = "#363636";
const BLACK = "#000000";



const ICON_FONT = "Arial";

const DIMENSION_WIDTH = Dimensions.get("window").width;
const DIMENSION_HEIGHT = Dimensions.get("window").height;

const styles = StyleSheet.create({
    // COMPONENT - CARD ITEM
    containerCardItem: {
        backgroundColor: WHITE,
        borderRadius: 8,
        alignItems: "center",
        margin: 10,
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowColor: BLACK,
        shadowOffset: { height: 0, width: 0 }
    },
    matchesCardItem: {
        marginTop: -35,
        backgroundColor: PRIMARY_COLOR,
        paddingVertical: 7,
        paddingHorizontal: 20,
        borderRadius: 20
    },
    matchesTextCardItem: {
        fontFamily: ICON_FONT,
        color: WHITE
    },
    descriptionCardItem: {
        color: GRAY,
        textAlign: "center"
    },
    location: {
        paddingBottom: 10,
        flexDirection: "row",
        alignItems: "center"
    },
    locationText: {
        color: GRAY,
        fontSize: 12
    },
    actionsCardItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 30
    },
    button: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: WHITE,
        marginHorizontal: 7,
        alignItems: "center",
        justifyContent: "center",
        shadowOpacity: 0.15,
        shadowRadius: 20,
        shadowColor: DARK_GRAY,
        shadowOffset: { height: 10, width: 0 }
    },
    miniButton: {
        width: 40,
        height: 40,
        borderRadius: 30,
        backgroundColor: WHITE,
        marginHorizontal: 7,
        alignItems: "center",
        justifyContent: "center",
        shadowOpacity: 0.15,
        shadowRadius: 20,
        shadowColor: DARK_GRAY,
        shadowOffset: { height: 10, width: 0 }
    },

    // COMPONENT - PROFILE ITEM
    containerProfileItem: {
        backgroundColor: WHITE,
        paddingHorizontal: 10,
        paddingBottom: 25,
        margin: 20,
        borderRadius: 8,
        marginTop: -65,
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowColor: BLACK,
        shadowOffset: { height: 0, width: 0 }
    },
    matchesProfileItem: {
        width: 131,
        marginTop: -15,
        backgroundColor: PRIMARY_COLOR,
        paddingVertical: 7,
        paddingHorizontal: 20,
        borderRadius: 20,
        textAlign: "center",
        alignSelf: "center"
    },
    matchesTextProfileItem: {
        fontFamily: ICON_FONT,
        color: WHITE
    },
    name: {
        paddingTop: 25,
        paddingBottom: 5,
        color: DARK_GRAY,
        fontSize: 15,
        textAlign: "center"
    },
    descriptionProfileItem: {
        color: GRAY,
        textAlign: "center",
        paddingBottom: 20,
        fontSize: 13
    },
    info: {
        paddingVertical: 8,
        flexDirection: "row",
        alignItems: "center"
    },
    iconProfile: {
        fontFamily: ICON_FONT,
        fontSize: 12,
        color: DARK_GRAY,
        paddingHorizontal: 10
    },
    infoContent: {
        color: GRAY,
        fontSize: 13
    },

    bg: {
        flex: 1,
        resizeMode: "cover",
        width: DIMENSION_WIDTH,
        height: DIMENSION_HEIGHT
    },
    top: {
        paddingTop: 50,
        marginHorizontal: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    title: { paddingBottom: 10, fontSize: 22, color: DARK_GRAY },
    icon: {
        fontFamily: ICON_FONT,
        fontSize: 20,
        color: DARK_GRAY,
        paddingRight: 10
    },


    containerHome: { marginHorizontal: 10 },

    containerMatches: {
        justifyContent: "space-between",
        flex: 1,
        paddingHorizontal: 10
    },


    containerMessages: {
        justifyContent: "space-between",
        flex: 1,
        paddingHorizontal: 10
    },


    containerProfile: { marginHorizontal: 0 },
    photo: {
        width: DIMENSION_WIDTH,
        height: 450
    },
    topIconLeft: {
        fontFamily: ICON_FONT,
        fontSize: 20,
        color: WHITE,
        paddingLeft: 20,
        marginTop: -20,
        transform: [{ rotate: "90deg" }]
    },
    topIconRight: {
        fontFamily: ICON_FONT,
        fontSize: 20,
        color: WHITE,
        paddingRight: 20
    },
    actionsProfile: {
        justifyContent: "center",
        flexDirection: "row",
        alignItems: "center"
    },
    iconButton: { fontFamily: ICON_FONT, fontSize: 20, color: WHITE },
    textButton: {
        fontFamily: ICON_FONT,
        fontSize: 15,
        color: WHITE,
        paddingLeft: 5
    },
    circledButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: PRIMARY_COLOR,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10
    },
    roundedButton: {
        justifyContent: "center",
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 10,
        height: 50,
        borderRadius: 25,
        backgroundColor: SECONDARY_COLOR,
        paddingHorizontal: 20
    },


    tabButton: {
        paddingTop: 20,
        paddingBottom: 30,
        alignItems: "center",
        justifyContent: "center",
        flex: 1
    },
    tabButtonText: {
        textTransform: "uppercase"
    },
    iconMenu: {
        fontFamily: ICON_FONT,
        height: 20,
        paddingBottom: 7
    }
});