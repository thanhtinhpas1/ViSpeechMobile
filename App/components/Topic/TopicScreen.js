import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, RefreshControl, Image } from "react-native";
import { Card } from 'react-native-elements';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { Actions } from 'react-native-router-flux';
import Topic from '../../database/schemas/topic.schema';
import { MyImages } from '../../assets/images'

export default TopicsScreen = () => {
    const [topics, setTopics] = useState([])
    const [refreshing, setRefreshing] = useState(false)

    const getDataFromDb = () => {
        console.log('[Refresh] Execute function getDataFromDb of TopicsScreen')
        let data = []
        try {
            data = Topic.get()
        } catch (err) {
            data = []
            console.log('[TopicsScreen] Error when execute function getDataFromDb')
            console.error(err)
        }
        setTopics(data)
    }

    useEffect(() => {
        getDataFromDb()
        const data = Topic.get()
        data.addListener(getDataFromDb)
        return () => {
            data.removeListener(getDataFromDb)
        }
    }, [Topic])

    const onRefresh = () => {
        setRefreshing(true)
        getDataFromDb()
        setRefreshing(false)
    }

    const onPressTopic = topic => {
        Actions.lessons({ topic })
    }

    return (
        <ScrollView style={styles.scrollView} refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
            {topics.map((topic, index) => {
                const image = topic.image ? MyImages[topic.image] : MyImages.learningTopic
                return (
                    <TouchableOpacity onPress={() => onPressTopic(topic)} key={topic.id}>
                        <Card containerStyle={{ ...styles.containerStyle, marginBottom: index === topics.length - 1 ? 40 : 10 }} wrapperStyle={styles.wrapperStyle}>
                            <View>
                                <Image source={image} style={styles.cardImage}></Image>
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{topic.name}</Text>
                                <Text style={styles.cardSubTitle}>{topic.totalCompletedLessons}/{topic.totalLessons} bài</Text>
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
    scrollView: {
        paddingTop: 15,
        paddingLeft: 10,
        paddingRight: 10
    },
    containerStyle: {
        borderWidth: 0,
        borderRadius: borderRadius,
        padding: 0
    },
    wrapperStyle: {
        overflow: "hidden",
        backgroundColor: cardColor,
        borderRadius: borderRadius,
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
        paddingRight: 15
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
