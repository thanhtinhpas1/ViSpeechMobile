import React, { useEffect, useState } from 'react';
import { BackHandler, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Actions } from 'react-native-router-flux';

export const HomeScreen = () => {
    const [menu, setMenu] = useState([])

    useEffect(() => {
        const menuList = [
            {
                text: 'Bắt đầu',
                onPress: () => {
                    Actions.topics()
                },
                iconLeft: {
                    source: require('../../assets/images/icons/start.png'),
                    style: styles.menuIconLeft
                },
                iconRight: {
                    source: require('../../assets/images/icons/arrowRight.png'),
                    style: styles.menuIconRight
                },

            }, {
                text: 'Lịch sử',
                onPress: () => {
                    Actions.history()
                },
                iconLeft: {
                    source: require('../../assets/images/icons/history.png'),
                    style: styles.menuIconLeft
                },
                iconRight: {
                    source: require('../../assets/images/icons/arrowRight.png'),
                    style: styles.menuIconRight
                },

            }, {
                text: 'Cài đặt',
                onPress: () => {
                    Actions.setting()
                },
                iconLeft: {
                    source: require('../../assets/images/icons/settings.png'),
                    style: styles.menuIconLeft
                },
                iconRight: {
                    source: require('../../assets/images/icons/arrowRight.png'),
                    style: styles.menuIconRight
                },

            }, {
                text: 'Thoát',
                onPress: () => {
                    // TODO: show popup touch again for exit
                    if (Platform.OS === 'android') {
                        // ToastAndroid.show('Touch again for exit app', ToastAndroid.SHORT);
                        BackHandler.exitApp();
                    } else {

                    }
                },
                iconLeft: {
                    source: require('../../assets/images/icons/logout.png'),
                    style: styles.menuIconLeft
                },
                iconRight: {
                    source: require('../../assets/images/icons/logout.png'),
                    style: styles.menuIconRight
                }
            }
        ]
        setMenu(menuList)
    }, [])

    return (
        <View style={styles.container}>
            <Text style={styles.header}>ViSpeech</Text>
            {menu.map(menuItem => {
                return (
                    <TouchableOpacity onPress={menuItem.onPress} style={styles.menu} key={menuItem.text}>
                        {menuItem.iconLeft &&
                            <Image
                                source={menuItem.iconLeft.source}
                                style={menuItem.iconLeft.style}
                            />
                        }
                        {menuItem.viewIconLeft &&
                            <View style={menuItem.viewIconLeft.style} />
                        }
                        <Text style={styles.menuText}>{menuItem.text}</Text>
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}

const borderRadius = 8
const backgroundColor = '#722ed1'
const styles = StyleSheet.create({
    container: {
        alignSelf: 'stretch',
        backgroundColor: backgroundColor,
        height: '100%',
    },
    header: {
        marginTop: 60,
        marginBottom: 20,
        fontFamily: 'space-mono',
        fontStyle: 'normal',
        fontWeight: 'bold',
        letterSpacing: 3,
        fontSize: 45,
        textAlign: 'center',
        color: '#efdbff',
        textShadowColor: '#120338',
        textShadowOffset: { width: 3, height: 3 },
        textShadowRadius: 40,
    },
    menu: {
        overflow: 'hidden',
        backgroundColor: '#FFF',
        padding: 20,
        paddingLeft: 30,
        paddingRight: 50,
        marginTop: 35,
        marginRight: 60,
        marginLeft: 60,
        borderRadius: borderRadius,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    menuIconLeft: {
        width: 35,
        height: 35,
        resizeMode: 'contain',
    },
    menuIconRight: {
        width: 35,
        height: 35,
        resizeMode: 'contain',
    },
    menuText: {
        fontSize: 25,
        color: '#22075e',
        fontWeight: 'bold'
    },
})
