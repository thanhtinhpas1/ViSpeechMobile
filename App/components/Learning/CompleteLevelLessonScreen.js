import React, { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Actions } from 'react-native-router-flux';

export default CompleteLevelLessonScreen = ({ levelLesson }) => {
    const [menu, setMenu] = useState([])

    useEffect(() => {
        const menuList = [
            {
                text: 'Học tiếp bài mới',
                onPress: () => {
                    const lesson = levelLesson.linkingObjects('Lesson', 'levelLessons')[0]
                    Actions.lessonDetails({ lesson })
                },
                iconRight: {
                    source: require('../../assets/images/icons/arrowRight.png'),
                    style: styles.menuIconRight
                },

            }, {
                text: 'Danh sách chủ đề',
                onPress: () => {
                    Actions.topics()
                },
                iconRight: {
                    source: require('../../assets/images/icons/arrowRight.png'),
                    style: styles.menuIconRight
                },

            }, {
                text: 'Danh sách bài học',
                onPress: () => {
                    const lesson = levelLesson.linkingObjects('Lesson', 'levelLessons')[0]
                    const topic = lesson.linkingObjects('Topic', 'lessons')[0]
                    Actions.lessons({ topic })
                },
                iconRight: {
                    source: require('../../assets/images/icons/arrowRight.png'),
                    style: styles.menuIconRight
                },
            }
        ]
        setMenu(menuList)
    }, [])

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Chúc mừng</Text>
            <Text style={styles.subHeader}>Bạn đã hoàn thành bài học</Text>
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
                        {menuItem.iconRight &&
                            <Image
                                source={menuItem.iconRight.source}
                                style={menuItem.iconRight.style}
                            />
                        }
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
        marginBottom: 10,
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
    subHeader: {
        fontFamily: 'space-mono',
        fontStyle: 'normal',
        fontWeight: 'bold',
        fontSize: 25,
        textAlign: 'center',
        color: '#22075e',
        marginTop: 0,
        marginLeft: 15,
        marginRight: 15,
        marginBottom: 20,
    },
    menu: {
        overflow: 'hidden',
        backgroundColor: '#FFF',
        padding: 20,
        paddingLeft: 30,
        paddingRight: 30,
        marginTop: 35,
        marginRight: 60,
        marginLeft: 60,
        borderRadius: borderRadius,
        // shadowColor: '#333',
        // shadowOffset: { width: 5, height: 5 },
        // shadowOpacity: 0.1,
        // shadowRadius: 10,
        // elevation: 10,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    menuIconLeft: {
        width: 31,
        height: 31,
        resizeMode: 'contain',
    },
    menuIconRight: {
        width: 31,
        height: 31,
        resizeMode: 'contain',
    },
    menuText: {
        fontSize: 23,
        color: '#22075e',
        fontWeight: 'bold'
    },
})
