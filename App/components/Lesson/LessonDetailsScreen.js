import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, RefreshControl, Image } from "react-native";
import { Card } from 'react-native-elements';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { Actions } from 'react-native-router-flux';
import Lesson from '../../database/schemas/lesson.schema';
import { MyImages } from '../../assets/images';
import { POINT_PER_QUESTION } from '../../utils/constants.util';

export default LessonDetailsScreen = ({ lesson }) => {
    const [lessonState, setLessonState] = useState({})
    const [refreshing, setRefreshing] = useState(false)

    const getDataFromDb = () => {
        console.log('[Refresh] Execute function getDataFromDb of LessonDetailsScreen')
        let data = {}
        try {
            data = Lesson.getFromId(lesson.id)
        } catch (err) {
            data = {}
            console.log('[LessonDetailsScreen] Error when execute function getDataFromDb')
            console.error(err)
        }
        setLessonState(data)
    }

    useEffect(() => {
        setLessonState(lesson)
        lesson.addListener(getDataFromDb)
        return () => {
            lesson.removeListener(getDataFromDb)
        }
    }, [lesson])

    const onRefresh = () => {
        setRefreshing(true)
        getDataFromDb()
        setRefreshing(false)
    }

    const onPressLevelLesson = levelLesson => {
        const currentQuestionIndex = levelLesson.isFinished ? 0 : levelLesson.totalCompletedQuestions
        Actions.learning({ levelLesson, currentQuestionIndex })
    }

    return (
        <ScrollView style={styles.scrollView} refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
            <Text style={styles.header}>Bài học {lessonState.name}</Text>
            {lessonState.levelLessons && lessonState.levelLessons.map((levelLesson, index) => {
                const image = levelLesson.image ? MyImages[levelLesson.image] : MyImages.learningLevelLesson
                const scoredPoints = Number(levelLesson.totalCorrectAnswers) * POINT_PER_QUESTION
                const totalPoints = Number(levelLesson.totalQuestions) * POINT_PER_QUESTION
                return (
                    <TouchableOpacity onPress={() => onPressLevelLesson(levelLesson)} key={levelLesson.id}>
                        <Card containerStyle={{ ...styles.containerStyle, marginBottom: index === lessonState.levelLessons.length - 1 ? 40 : 10 }} wrapperStyle={styles.wrapperStyle}>
                            <View>
                                <Image source={image} style={styles.cardImage}></Image>
                            </View>
                            <View style={styles.cardContent}>
                                <View style={{ flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={styles.cardTitle}>Cấp độ {levelLesson.level.name}</Text>
                                    <Text style={styles.cardSubTitle}>{levelLesson.totalCompletedQuestions}/{levelLesson.totalQuestions} câu hỏi</Text>
                                </View>
                                {levelLesson.isFinished &&
                                    <View>
                                        <Text style={{ ...styles.cardSubTitle, color: '#f9f0ff', textAlign: 'left', marginTop: 3 }}>{scoredPoints}/{totalPoints} điểm</Text>
                                    </View>
                                }
                            </View>
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
