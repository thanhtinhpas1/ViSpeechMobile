import { SCHEMA } from "../../utils/constants.util";

export default class History {
    static schema = {
        name: SCHEMA.HISTORY,
        primaryKey: 'id',
        properties: {
            id: 'int',
            topicId: { type: 'int' },
            lessonId: { type: 'int' },
            levelLessonId: { type: 'int' },
            topicName: { type: 'string' },
            lessonName: { type: 'string' },
            image: { type: 'string' },
            isFinished: { type: 'bool' },
            level: { type: 'Level' },
            totalCorrectAnswers: { type: 'int' },
            totalCompletedQuestions: { type: 'int' },
            totalQuestions: { type: 'int' },
            relearn: { type: 'bool', default: false },
            updatedDate: { type: 'date', default: new Date() },
            createdDate: { type: 'date', default: new Date() }
        }
    }

    static createHistory = (realm, history) => {
        if (!history) {
            return Promise.reject(`New history is ${history}`)
        }
        const { topicId, lessonId, levelLessonId, topicName, lessonName, image, isFinished,
            level, totalCorrectAnswers, totalCompletedQuestions, totalQuestions, relearn } = history
        if (!topicId || !lessonId || !levelLessonId) {
            return Promise.reject('New history is invalid')
        }
        const data = {
            id: History.getPrimaryKeyId(),
            topicId,
            lessonId,
            levelLessonId,
            topicName,
            lessonName,
            image,
            isFinished,
            level,
            totalCorrectAnswers,
            totalCompletedQuestions,
            totalQuestions,
            relearn,
            updatedDate: new Date()
        }
        console.log('History [createHistory] data: ', data)
        const writeFunc = () => {
            realm.create(History.getSchemaName(), data, true)
            return Promise.resolve(data)
        }
        return History.writePromise(writeFunc)
    }

    static isExisted = (topicId, lessonId, levelLessonId) => {
        const histories = History.get()
        const filteredList = histories.filtered(`topicId == ${topicId} AND lessonId == ${lessonId} AND levelLessonId == ${levelLessonId}`)
        return filteredList.length > 0
    }

    static getUnfinishedLevelLesson = (topicId, lessonId, levelLessonId) => {
        const histories = History.get()
        const history = histories.filtered(`topicId == ${topicId} AND lessonId == ${lessonId} AND levelLessonId == ${levelLessonId} AND isFinished == false`)
        return history[0] || {}
    }

    updateData(isFinished, totalCorrectAnswers, totalCompletedQuestions) {
        if (isFinished == null || totalCorrectAnswers == null || totalCompletedQuestions == null
            || totalCorrectAnswers < 0 || totalCompletedQuestions < 0
            || totalCorrectAnswers > this.totalQuestions || totalCompletedQuestions > this.totalQuestions) {
            return Promise.reject(`Update history data is invalid`)
        }
        const writeFunc = () => {
            this.isFinished = isFinished
            this.totalCorrectAnswers = totalCorrectAnswers
            this.totalCompletedQuestions = totalCompletedQuestions
            this.updatedDate = new Date()
            return Promise.resolve()
        }
        return History.writePromise(writeFunc)
    }
}