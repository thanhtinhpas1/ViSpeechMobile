import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Image, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Card } from 'react-native-elements';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { MyImages } from '../../assets/images';
import History from '../../database/schemas/history.schema';
import LevelLesson from '../../database/schemas/level-lesson.schema';
import { POINT_PER_QUESTION } from '../../utils/constants.util';


export const HistoryScreen = () => {
    const [histories, setHistories] = useState([])
    const [refreshing, setRefreshing] = useState(false)

    const getDataFromDb = () => {
        console.log('[Refresh] Execute function getDataFromDb of HistoryScreen')
        let data = []
        try {
            const histories = History.get()
            data = History.sortByProperty(histories, 'updatedDate', true)
        } catch (err) {
            data = []
            console.log('[HistoryScreen] Error when execute function getDataFromDb')
            console.error(err)
        }
        setHistories(data)
    }

    useEffect(() => {
        getDataFromDb()
        const data = History.get()
        data.addListener(getDataFromDb)
        return () => {
            data.removeListener(getDataFromDb)
        }
    }, [History])

    const onRefresh = () => {
        setRefreshing(true)
        getDataFromDb()
        setRefreshing(false)
    }

    const onPressRelearn = levelLessonId => {
        const levelLesson = LevelLesson.getFromId(levelLessonId)
        const currentQuestionIndex = levelLesson.totalCompletedQuestions
        Actions.learning({ levelLesson, currentQuestionIndex })
    }

    return ( <
        ScrollView style = { styles.scrollView }
        refreshControl = { <
            RefreshControl refreshing = { refreshing }
            onRefresh = { onRefresh } />
        } > 
        
        {histories.map((history, index) => {
                const image = history.image ? MyImages[history.image] : MyImages.learningTopic
                const scoredPoints = Number(history.totalCorrectAnswers) * POINT_PER_QUESTION
                const totalPoints = Number(history.totalQuestions) * POINT_PER_QUESTION
                const btnText = !history.isFinished ? 'Tiếp tục' : (history.relearn ? 'Đã học lại' : 'Hoàn thành')
                const btnTextStyle = {
                    backgroundColor: history.isFinished ? '#fff' : cardColor,
                    borderColor: history.isFinished ? cardColor : '#fff',
                    color: history.isFinished ? cardColor : '#fff'
                }
                const cardContent = [
                    { icon: 'book-open', text: history.lessonName },
                    { icon: 'tachometer-alt', text: `Cấp độ ${history.level.name}` },
                    {
                        icon: 'check', text: history.isFinished ?
                            `${scoredPoints}/${totalPoints} điểm` :
                            `${history.totalCompletedQuestions}/${history.totalQuestions} câu hỏi`
                    },
                    { icon: 'history', text: moment(history.updatedDate).format('DD/MM/YYYY HH:mm') },
                ]
                const cardContentHtml = cardContent.map(item => {
                    return (
                        <View style={styles.textHasIcon} key={`${history.id}-${item.icon}`}>
                            <Icon
                                name={item.icon}
                                style={styles.icon}
                            />
                            <Text style={styles.cardText}>
                                {item.text}
                            </Text>
                        </View>
                    )
                })
                return (
                    <TouchableOpacity key={history.id} disabled={history.isFinished} onPress={() => onPressRelearn(history.levelLessonId)}>
                        <Card containerStyle={{ ...styles.containerStyle, marginBottom: index === histories.length - 1 ? 40 : 10 }} wrapperStyle={styles.wrapperStyle}>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 10 }}>
                                <View>
                                    <Image source={image} style={styles.cardImage}></Image>
                                </View>
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle}>Chủ đề {history.topicName}</Text>
                                    {cardContentHtml}
                                </View>
                            </View>
                            <View style={{ ...styles.footer, backgroundColor: btnTextStyle.backgroundColor, borderWidth: 1, borderColor: btnTextStyle.borderColor }}>
                                <Text style={{ color: btnTextStyle.color, fontWeight: 'bold', fontSize: 16 }}>
                                    {btnText}
                                </Text>
                            </View>
                        </Card>
                    </TouchableOpacity>
                )
            })}

        </ScrollView >
    )
}

const borderRadius = 8
const cardColor = '#531dab'
const styles = StyleSheet.create({
    scrollView: {
        paddingTop: 15,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: '#efdbff'
    },
    containerStyle: {
        overflow: "hidden",
        borderWidth: 0,
        borderRadius: borderRadius,
        padding: 0,
    },
    wrapperStyle: {
        backgroundColor: '#fff',
        padding: 10
    },
    footer: {
        borderRadius: borderRadius,
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 10
    },
    cardImage: {
        height: 140,
        width: 140,
        resizeMode: 'cover',
        borderRadius: borderRadius
    },
    cardContent: {
        flexWrap: 'wrap',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        marginLeft: 10
    },
    cardTitle: {
        color: '#22075e',
        alignSelf: 'center',
        fontWeight: 'bold',
        fontSize: 18,
    },
    textHasIcon: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        height: 'auto'
    },
    icon: {
        margin: 0,
        padding: 0,
        fontSize: 14,
        color: '#9254de',
        marginRight: 8,
        marginTop: 9
    },
    cardText: {
        fontSize: 16,
        marginTop: 5
    },
});