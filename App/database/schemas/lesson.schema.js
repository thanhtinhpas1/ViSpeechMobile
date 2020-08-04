import { SCHEMA } from "../../utils/constants.util";
import LevelLesson from "./level-lesson.schema";
import { Utils } from '../../utils';

export default class Lesson {
    static schema = {
        name: SCHEMA.LESSON,
        primaryKey: 'id',
        properties: {
            id: { type: 'int' },
            name: { type: 'string' },
            image: { type: 'string' },
            isFinished: { type: 'bool', default: false },
            currentLevel: { type: 'Level', optional: true },
            totalCorrectAnswers: { type: 'int', default: 0 },
            totalCompletedQuestions: { type: 'int', default: 0 },
            totalQuestions: { type: 'int', default: 0 },
            levelLessons: { type: 'list', objectType: 'LevelLesson' },
            topic: { type: 'linkingObjects', objectType: 'Topic', property: 'lessons' },
            createdDate: { type: 'date', default: new Date() }
        }
    }

    setName(name) {
        if (!name) {
            return Promise.reject('Lesson name is empty')
        }
        const writeFunc = () => {
            this.name = name
            return Promise.resolve(name)
        }
        return Lesson.writePromise(writeFunc)
    }

    setImage(imageUrl) {
        if (!imageUrl) {
            return Promise.reject('Lesson imageUrl is empty')
        }
        const writeFunc = () => {
            this.image = imageUrl
            return Promise.resolve(imageUrl)
        }
        return Lesson.writePromise(writeFunc)
    }

    setIsFinished() {
        const writeFunc = () => {
            console.log(this.levelLessons)
            const hardestLevelLesson = getHardestLevelLesson(this.levelLessons)
            const currentLevelLesson = getCurrentLevelLesson(this.levelLessons)

            if (currentLevelLesson && hardestLevelLesson) {
                console.log(`Lesson [setIsFinished]: currentLevelLesson.level.value: ${currentLevelLesson.level.value}`)
                console.log(`Lesson [setIsFinished]: hardestLevelLesson.level.value: ${hardestLevelLesson.level.value}`)
                const finished = currentLevelLesson.level.value === hardestLevelLesson.level.value && currentLevelLesson.isFinished
                this.isFinished = finished
                console.log(`Lesson [setIsFinished]: ${finished}`)
            }
            return Promise.resolve()
        }
        return Lesson.writePromise(writeFunc)
    }

    updateStatus() {
        const writeFunc = () => {
            const currentLevelLesson = getCurrentLevelLesson(this.levelLessons)
            if (currentLevelLesson) {
                this.currentLevel = currentLevelLesson.level
                this.totalCorrectAnswers = currentLevelLesson.totalCorrectAnswers
                this.totalCompletedQuestions = currentLevelLesson.totalCompletedQuestions
                this.totalQuestions = currentLevelLesson.totalQuestions
                console.log(`Lesson [updateStatus]: { currentLevel: ${currentLevelLesson.level},
                totalCorrectAnswers: ${currentLevelLesson.totalCorrectAnswers},
                totalCompletedQuestions: ${currentLevelLesson.totalCompletedQuestions},
                totalQuestions: ${currentLevelLesson.totalQuestions} }`)
            }
            return Promise.resolve()
        }
        return Lesson.writePromise(writeFunc)
    }

    setTotalCompletedQuestions(totalCompletedQuestions) {
        if (totalCompletedQuestions == null || totalCompletedQuestions < 0) {
            return Promise.reject("Lesson's totalCompletedQuestions is invalid")
        }
        const writeFunc = () => {
            this.totalCompletedQuestions = totalCompletedQuestions
            return Promise.resolve(totalCompletedQuestions)
        }
        return Lesson.writePromise(writeFunc)
    }

    insertLevelLessons(levelLessons) {
        if (!Array.isArray(levelLessons) || levelLessons.length === 0) {
            return Promise.reject("Lesson's levelLessons is empty")
        }
        const writeFunc = () => {
            for (const levelLesson of levelLessons) {
                this.levelLessons.push(levelLesson)
            }
            return Promise.resolve(levelLessons)
        }
        return Lesson.writePromise(writeFunc)
    }

    static removeLesson = (realm, id) => {
        const lesson = Lesson.getFromId(id)
        const writeFunc = async () => {
            await LevelLesson.removeLevelLessonsByLessonId(realm, lesson.id)
            realm.delete(lesson)
            return Promise.resolve()
        }
        return Lesson.writePromise(writeFunc)
    }

    static removeLessonsByTopicId = (realm, topicId) => {
        let lessons = Lesson.get()
        lessons = lessons.filtered(`'topic.id = ${topicId}'`)
        return removeLessons(realm, lessons)
    }

    static removeAllLessons = realm => {
        const lessons = Lesson.get()
        return removeLessons(realm, lessons)
    }
}

const removeLessons = (realm, lessons) => {
    const writeFunc = async () => {
        for (const lesson of lessons) {
            await LevelLesson.removeLevelLessonsByLessonId(realm, lesson.id)
        }
        realm.delete(lessons)
        return Promise.resolve()
    }
    return Lesson.writePromise(writeFunc)
}

const getCurrentLevelLesson = levelLessons => { // get in-progress level lesson which has highest level
    const filteredList = levelLessons.filter(item => item.totalCompletedQuestions >= 0)
    const sortFunc = (a, b) => {
        return b.level.value - a.level.value
    }
    const levelLesson = Utils.sortByFunc(filteredList, sortFunc)[0] || {}
    return levelLesson
}

const getHardestLevelLesson = levelLessons => {
    const filteredList = levelLessons.filter(item => item)
    const sortFunc = (a, b) => {
        return b.level.value - a.level.value
    }
    const levelLesson = Utils.sortByFunc(filteredList, sortFunc)[0] || {}
    return levelLesson
}
