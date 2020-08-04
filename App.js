import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import React, { useEffect, useState } from 'react';
import { Router, Scene } from 'react-native-router-flux';
import { HistoryScreen } from './App/components/History/HistoryScreen';
import { HomeScreen } from './App/components/Home/HomeScreen';
import { LearningScreen } from './App/components/Learning/LearningScreen';
import SettingScreen from './App/components/Setting/SettingScreen';
import { TopicsScreen } from './App/components/Topic/TopicScreen';
import { openDB } from './App/database/realm';
import { LessonsScreen } from './App/components/Lesson/LessonsScreen';
import { LessonDetailsScreen } from './App/components/Lesson/LessonDetailsScreen';
import { CompleteLevelLessonScreen } from './App/components/Learning/CompleteLevelLessonScreen';

export default function App(props) {
  const [isLoadingComplete, setLoadingComplete] = useState(false)

  // Load any resources or data that we need prior to rendering the app
  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        setLoadingComplete(false)
        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          'space-mono': require('./App/assets/fonts/SpaceMono-Regular.ttf'),
        })
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e)
      } finally {
        setLoadingComplete(true)
      }
    }
    loadResourcesAndDataAsync()
  }, []);

  useEffect(() => {
    console.log("Open DB from app.js")
    openDB()
  }, [openDB]);

  return (
    <>
      {!isLoadingComplete && !props.skipLoadingScreen ? null :
        <Router>
          <Scene key="root">
            <Scene key="home" component={HomeScreen} hideNavBar={true} initial={true} />
            <Scene key="topics" component={TopicsScreen} title="Chủ đề" />
            <Scene key="lessons" component={LessonsScreen} title="Bài học" />
            <Scene key="lessonDetails" component={LessonDetailsScreen} title="Chi tiết bài học" />
            <Scene key="learning" component={LearningScreen} title="Câu hỏi" />
            <Scene key="completeLearning" component={CompleteLevelLessonScreen} title="Hoàn thành" />
            <Scene key="history" component={HistoryScreen} title="Lịch sử" />
            <Scene key="setting" component={SettingScreen} title="Cài đặt" />
          </Scene>
        </Router>
      }
    </>
  )
}
