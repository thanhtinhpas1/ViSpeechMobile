import { SCHEMA } from "../../utils/constants.util";

export default class LevelLesson {
    static schema = {
        name: SCHEMA.LEVEL_LESSON,
        primaryKey: 'id',
        properties: {
            id: { type: 'int' },
            image: { type: 'string' },
            isFinished: { type: 'bool', default: false },
            level: { type: 'Level' },
            totalCorrectAnswers: { type: 'int', default: 0 },
            totalCompletedQuestions: { type: 'int', default: 0 },
            totalQuestions: { type: 'int', default: 0 },
            questions: { type: 'list', objectType: 'Question' }, 
            lesson:  { type: 'linkingObjects', objectType: 'Lesson', property: 'levelLessons' },
            createdDate: { type: 'date', default: new Date() }
        }
    }

    setName(name) {
        if (!name) {
            return Promise.reject('Level lesson name is empty')
        }
        const writeFunc = () => {
            this.name = name
            return Promise.resolve(name)
        }
        return LevelLesson.writePromise(writeFunc)
    }

    setImage(imageUrl) {
        if (!imageUrl) {
            return Promise.reject('Level lesson imageUrl is empty')
        }
        const writeFunc = () => { 
            this.image = imageUrl 
            return Promise.resolve(imageUrl)
        }
        return LevelLesson.writePromise(writeFunc)
    }

    setIsFinished() {
        const writeFunc = () => {
            const finished = this.totalCompletedQuestions === this.totalQuestions ? true : false
            this.isFinished = finished
            console.log('LevelLesson [setIsFinished]: ', finished)
            return Promise.resolve(finished)
        }
        return LevelLesson.writePromise(writeFunc)
    }

    setLevel(level) {
        if (!level) {
            return Promise.reject("Level lesson's level is invalid")
        }
        const writeFunc = () => {
            this.level = level
            return Promise.resolve(level)
        }
        return LevelLesson.writePromise(writeFunc)
    }

    setTotalCorrectAnswers(totalCorrectAnswers) {
        if (totalCorrectAnswers == null || totalCorrectAnswers < 0 || totalCorrectAnswers > this.totalQuestions) {
            return Promise.reject("Level lesson's totalCorrectAnswers is invalid")
        }
        const writeFunc = () => {
            this.totalCorrectAnswers = totalCorrectAnswers
            console.log('LevelLesson [setTotalCorrectAnswers]: ', totalCorrectAnswers)
            return Promise.resolve(totalCorrectAnswers)
        }
        return LevelLesson.writePromise(writeFunc)
    }

    setTotalCompletedQuestions(totalCompletedQuestions) {
        if (totalCompletedQuestions == null || totalCompletedQuestions < 0) {
            return Promise.reject("Level lesson's totalCompletedQuestions is invalid")
        }
        const writeFunc = () => {
            this.totalCompletedQuestions = totalCompletedQuestions
            console.log('LevelLesson [setTotalCompletedQuestions]: ', totalCompletedQuestions)
            return Promise.resolve(totalCompletedQuestions)
        }
        return LevelLesson.writePromise(writeFunc)
    }

    insertQuestions(questions) {
        if (!Array.isArray(questions) || questions.length === 0) {
            return Promise.reject("Level lesson's questions is empty")
        }
        const writeFunc = () => {
            for (const question of questions) {
                this.questions.push(question)
            }
            return Promise.resolve(questions)
        }
        return LevelLesson.writePromise(writeFunc)
    }

    static removeLevelLesson = (realm, id) => {
        const levelLesson = LevelLesson.getFromId(id)
        const writeFunc = () => {
            realm.delete(levelLesson.questions)
            realm.delete(levelLesson)
            return Promise.resolve()
        }
        return LevelLesson.writePromise(writeFunc)
    }

    static removeLevelLessonsByLessonId = (realm, lessonId) => {
        let levelLessons = LevelLesson.get()
        levelLessons = levelLessons.filtered(`'lesson.id = ${lessonId}'`)
        return removeLevelLessons(realm, levelLessons)
    }

    static removeAllLevelLessons = realm => {
        const levelLessons = LevelLesson.get()
        return removeLevelLessons(realm, levelLessons)
    }
}

const removeLevelLessons = (realm, levelLessons) => {
    const writeFunc = () => {
        for (const levelLesson of levelLessons) {
            realm.delete(levelLesson.questions)
        }
        realm.delete(levelLessons)
        return Promise.resolve()
    }
    return LevelLesson.writePromise(writeFunc)
}