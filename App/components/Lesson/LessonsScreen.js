import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, RefreshControl, Image } from "react-native";
import { Card } from 'react-native-elements';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { Actions } from 'react-native-router-flux';
import Lesson from '../../database/schemas/lesson.schema';
import { MyImages } from '../../assets/images';

export default LessonsScreen = ({ topic }) => {
    const [lessons, setLessons] = useState([])
    const [refreshing, setRefreshing] = useState(false)

    const getDataFromDb = () => {
        console.log('[Refresh] Execute function getDataFromDb of LessonsScreen')
        let data = []
        try {
            data = Lesson.filter(`topic.id == ${topic.id}`)
        } catch (err) {
            data = []
            console.log('[LessonsScreen] Error when execute function getDataFromDb')
            console.error(err)
        }
        setLessons(data)
    }

    useEffect(() => {
        getDataFromDb()
        const data = Lesson.filter(`topic.id == ${topic.id}`)
        data.addListener(getDataFromDb)
        return () => {
            data.removeListener(getDataFromDb)
        }
    }, [Lesson])

    const onRefresh = () => {
        setRefreshing(true)
        getDataFromDb()
        setRefreshing(false)
    }

    const onPressLesson = lesson => {
        Actions.lessonDetails({ lesson })
    }

    return (
        <ScrollView style={styles.scrollView} refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
            <Text style={styles.header}>Chủ đề {topic.name}</Text>
            {lessons.map((lesson, index) => {
                const image = lesson.image ? MyImages[lesson.image] : MyImages.learningLesson
                return (
                    <TouchableOpacity onPress={() => onPressLesson(lesson)} key={lesson.id}>
                        <Card containerStyle={{ ...styles.containerStyle, marginBottom: index === lessons.length - 1 ? 40 : 10 }} wrapperStyle={styles.wrapperStyle}>
                            <View>
                                <Image source={image} style={styles.cardImage}></Image>
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{lesson.name}</Text>
                            </View>
                            {lesson.currentLevel &&
                                <View style={{ ...styles.cardContent, paddingTop: 0 }}>
                                    <Text style={styles.cardSubTitle}>Cấp độ {lesson.currentLevel.name}</Text>
                                    <Text style={styles.cardSubTitle}>Hoàn thành {lesson.totalCompletedQuestions}/{lesson.totalQuestions}</Text>
                                </View>
                            }
                        </Card>
                    </TouchableOpacity>
                )
            })}
        </ScrollView>
    )
}

const borderRadius = 8
const cardColor = '#531dab'
const styles = StyleSheet.create({
    header: {
        fontFamily: 'space-mono',
        fontStyle: 'normal',
        fontWeight: 'bold',
        fontSize: 25,
        textAlign: 'center',
        color: '#22075e',
        margin: 8,
        marginLeft: 15,
        marginRight: 15,
    },
    scrollView: {
        paddingTop: 15,
        paddingLeft: 10,
        paddingRight: 10
    },
    containerStyle: {
        overflow: "hidden",
        borderWidth: 0,
        borderRadius: borderRadius,
        padding: 0,
    },
    wrapperStyle: {
        overflow: "hidden",
        backgroundColor: cardColor,
        padding: 0
    },
    cardImage: {
        height: 150,
        width: '100%',
        resizeMode: 'cover',
    },
    cardContent: {
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        paddingLeft: 15,
        paddingRight: 15,
    },
    cardTitle: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 20,
    },
    cardSubTitle: {
        color: '#FFF',
        fontSize: 18,
    },
});
