import React, { useEffect, useState } from 'react';
import { Alert, Image, PermissionsAndroid, StyleSheet, Text, TextInput, View } from "react-native";
import AudioRecord from 'react-native-audio-record';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome5';
import AsrService from '../../services/asr.service';
import { MyImages } from '../../assets/images';
import { Actions } from 'react-native-router-flux';
import Topic from '../../database/schemas/topic.schema';
import Lesson from '../../database/schemas/lesson.schema';
import realm from '../../database/realm';
import History from '../../database/schemas/history.schema';

export const LearningScreen = ({ levelLesson, currentQuestionIndex }) => {
    const [question, setQuestion] = useState({})
    const [recording, setRecording] = useState(false)
    const [disableRecording, setDisableRecording] = useState(false)
    const [replyFromAsr, setReplyFromAsr] = useState('')
    const [hasAudioPermission, setHasAudioPermission] = useState(false)

    const requestAudioRuntimePermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                {
                    'title': 'ReactNativeCode Record Audio Permission',
                    'message': 'ReactNativeCode App needs access to your location '
                }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                // Alert.alert("Record Audio Permission Granted.")
                setHasAudioPermission(true)
                const options = {
                    sampleRate: 16000,  // default 44100
                    channels: 1,        // 1 or 2, default 1
                    bitsPerSample: 16,  // 8 or 16, default 16
                    audioSource: 6,     // android only
                    wavFile: 'audio.wav' // default 'audio.wav'
                }
                AudioRecord.init(options)
            } else {
                Alert.alert("Record Audio Permission Not Granted")
            }
        } catch (err) {
            console.log('[LearningScreen] Warning when execute function requestAudioRuntimePermission')
            console.warn(err)
        }
    }

    const updateLessonAndTopic = async () => {
        try {
            // update lesson
            const lessonId = levelLesson.linkingObjects('Lesson', 'levelLessons')[0].id
            const lesson = Lesson.getFromId(lessonId)
            await lesson.updateStatus()
            await lesson.setIsFinished()
            // update topic
            const topicId = lesson.linkingObjects('Topic', 'lessons')[0].id
            const topic = Topic.getFromId(topicId)
            const totalCompletedLessons = topic.lessons.filter(item => item.isFinished === true).length
            await topic.setTotalCompletedLessons(totalCompletedLessons)
            await topic.setIsFinished()
        } catch (err) {
            console.log('[LearningScreen] Error when execute function updateLessonAndTopic')
            console.error(err)
        }
    }

    const backToLessonDetails = () => {
        const lesson = levelLesson.linkingObjects('Lesson', 'levelLessons')[0]
        Actions.lessonDetails({ lesson })
    }

    const relearn = async () => {
        try {
            for (let question of levelLesson.questions) {
                await question.setIsFinished(false)
            }
            await levelLesson.setTotalCorrectAnswers(0)
            await levelLesson.setTotalCompletedQuestions(0)
            await levelLesson.setIsFinished()
            await updateLessonAndTopic()
            await updateHistory(true)
        } catch (err) {
            console.log('[LearningScreen] Error when execute function relearn')
            console.error(err)
        }
    }

    useEffect(() => {
        requestAudioRuntimePermission()
        if (levelLesson.isFinished) {
            Alert.alert("Thông báo", "Bạn đã hoàn thành khoá học.",
                [
                    { text: "Trở về", onPress: () => backToLessonDetails(), style: "cancel" },
                    { text: "Học lại", onPress: () => relearn() }
                ],
                { cancelable: false }
            );
        }
    }, [levelLesson])

    useEffect(() => {
        const data = levelLesson.questions[currentQuestionIndex]
        if (data) {
            setQuestion(data)
        }
    }, [levelLesson, currentQuestionIndex])

    const handleCompleteQuestion = async () => {
        try {
            await question.setIsFinished(true)
            await levelLesson.setTotalCompletedQuestions(levelLesson.totalCompletedQuestions + 1)
            await levelLesson.setIsFinished()

            updateLessonAndTopic()
        } catch (err) {
            console.log('[LearningScreen] Error when execute function handleCompleteQuestion')
            console.error(err)
        }
    }

    const updateHistory = async (relearn = false) => {
        try {
            const levelLessonId = levelLesson.id
            const lessonId = levelLesson.linkingObjects('Lesson', 'levelLessons')[0].id
            const lesson = Lesson.getFromId(lessonId)
            const topicId = lesson.linkingObjects('Topic', 'lessons')[0].id
            if (History.isExisted(topicId, lessonId, levelLessonId)) {
                const history = History.getUnfinishedLevelLesson(topicId, lessonId, levelLessonId)
                if (history.id) {
                    const isFinished = levelLesson.isFinished
                    const totalCorrectAnswers = levelLesson.totalCorrectAnswers
                    const totalCompletedQuestions = levelLesson.totalCompletedQuestions
                    await history.updateData(isFinished, totalCorrectAnswers, totalCompletedQuestions)
                    return
                }
            }

            // not existed || relearn level lesson => create new history
            const topicName = Topic.getFromId(topicId).name
            const lessonName = lesson.name
            const newHistory = {
                topicId, lessonId, levelLessonId, topicName, lessonName,
                image: levelLesson.image,
                isFinished: false,
                level: levelLesson.level,
                totalCorrectAnswers: levelLesson.totalCorrectAnswers,
                totalCompletedQuestions: levelLesson.totalCompletedQuestions,
                totalQuestions: levelLesson.totalQuestions,
                relearn
            }
            await History.createHistory(realm, newHistory)
        } catch (err) {
            console.log('[LearningScreen] Error when execute function updateHistory')
            console.error(err)
        }
    }

    const onPressRecord = async () => {
        if (!hasAudioPermission) {
            console.warn('Can\'t record, no permission granted!')
            return
        }

        if (!recording) {
            console.log('audio start')
            AudioRecord.start()
            setRecording(true)
        } else {
            console.log('call asr')
            const path = await AudioRecord.stop()
            const result = await AsrService.callAsr(path)
            console.log('audio stop')
            const reply = result.text || result.message
            console.log(reply)
            setReplyFromAsr(reply)
            setRecording(false)
            // correct answer
            if (reply.includes(question.answer)) {
                try {
                    setDisableRecording(true)
                    await levelLesson.setTotalCorrectAnswers(levelLesson.totalCorrectAnswers + 1)
                    await handleCompleteQuestion()
                    await updateHistory()
                } catch (err) {
                    console.log('[LearningScreen] Error when handle correct answer')
                    console.error(err)
                }
            }
        }
    }

    const onPressSupport = async () => {
        // correct answer
        setReplyFromAsr(question.answer)
        setDisableRecording(true)
        await handleCompleteQuestion()
        await updateHistory()
    }

    const onPressNext = () => {
        const index = currentQuestionIndex + 1
        if (levelLesson.questions[index]) {
            if (currentQuestionIndex !== 0) Actions.push('learning', { levelLesson, currentQuestionIndex: index })
            else {
                Actions.push('learning', { levelLesson, currentQuestionIndex: index })
            }

        } else if (levelLesson.questions.length <= index) {
            Actions.push('completeLearning', { levelLesson })
        }
    }

    return (
        <View style={ styles.body }>
            <Text style={ styles.header }>Câu hỏi { currentQuestionIndex + 1 }/{ levelLesson.totalQuestions }</Text>
            <View style={ styles.imageContainer }>
                { question.images &&
                <Image key={ question.images[0] } source={ MyImages[question.images[0]] }
                       style={ styles.image }/>
                }
            </View>
            <Text style={ styles.quizText }>{ question.content }</Text>
            <View style={ styles.textSpeechContainer }>
                <TextInput
                    style={ styles.textSpeech }
                    editable={ false }
                    value={ replyFromAsr }
                    multiline
                    numberOfLines={ 3 }
                />
            </View>
            <Button
                disabled={ disableRecording }
                onPress={ onPressRecord }
                title={ recording ? 'Dừng' : 'Trả lời' }
                buttonStyle={ styles.button }
                containerStyle={ styles.buttonContainer }
                iconContainerStyle={ styles.iconContainer }
                icon={ <Icon
                    name="microphone"
                    size={ 25 }
                    color="white"
                    style={ styles.icon }
                /> }
            />
            <Button
                disabled={ disableRecording }
                onPress={ onPressSupport }
                title="Gợi ý"
                buttonStyle={ styles.button }
                containerStyle={ styles.buttonContainer }
                iconContainerStyle={ styles.iconContainer }
                icon={ <Icon
                    name="book"
                    size={ 25 }
                    color="white"
                    style={ styles.icon }
                /> }
            />
            <Button
                disabled={ !disableRecording }
                onPress={ onPressNext }
                title="Tiếp theo"
                buttonStyle={ styles.button }
                containerStyle={ styles.buttonContainer }
                iconContainerStyle={ styles.iconContainer }
                icon={ <Icon
                    name="arrow-right"
                    size={ 25 }
                    color="white"
                    style={ styles.icon }
                /> }
            />
        </View>
    )
}

const borderRadius = 8
const backgroundColor = '#531dab'
const styles = StyleSheet.create({
    body: {
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 20,
        marginRight: '5%',
        marginLeft: '5%',
    },
    header: {
        fontFamily: 'space-mono',
        fontStyle: 'normal',
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
        color: '#22075e',
        marginBottom: 10,
    },
    imageContainer: {
        height: '30%',
        width: "100%",
        marginBottom: 15,
    },
    image: {
        borderRadius: borderRadius,
        height: '100%',
        width: '100%',
        resizeMode: 'cover',
    },
    quizText: {
        fontSize: 20,
        color: '#22075e',
        marginBottom: 15,
    },
    textSpeechContainer: {
        marginBottom: 30,
        alignSelf: 'stretch',
    },
    textSpeech: {
        fontSize: 16,
        color: '#391085',
        backgroundColor: "#fff",
        borderColor: '#b37feb',
        borderRadius: borderRadius,
        borderWidth: 1,
        padding: 0,
        paddingLeft: 15,
        paddingRight: 15,
        marginLeft: '10%',
        marginRight: '10%',
    },
    buttonContainer: {
        width: 200,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
    },
    button: {
        padding: 10,
        paddingLeft: 50,
        paddingRight: 20,
        borderRadius: borderRadius,
        backgroundColor: backgroundColor,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    iconContainer: {},
    icon: {
        marginRight: 30
    }
});
