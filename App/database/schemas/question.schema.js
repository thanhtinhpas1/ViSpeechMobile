import { SCHEMA } from "../../utils/constants.util";

export default class Question {
    static schema = {
        name: SCHEMA.QUESTION,
        primaryKey: 'id',
        properties: {
            id: { type: 'int' },
            isFinished: { type: 'bool', default: false },
            content: { type: 'string' },
            answer: { type: 'string' },
            audio: { type: 'string' },
            images: { type: 'list', objectType: 'string' },
            levelLesson: { type: 'linkingObjects', objectType: 'LevelLesson', property: 'questions' },
            createdDate: { type: 'date', default: new Date() }
        }
    }

    setIsFinished(isFinished) {
        if (isFinished == null) {
            return Promise.reject('Question isFinished is empty')
        }
        const writeFunc = () => {
            this.isFinished = isFinished
            console.log('Question [setIsFinished]: ', isFinished)
            return Promise.resolve(isFinished)
        }
        return Question.writePromise(writeFunc)
    }

    setContent(content) {
        if (!content) {
            return Promise.reject('Question content is empty')
        }
        const writeFunc = () => {
            this.content = content
            return Promise.resolve(content)
        }
        return Question.writePromise(writeFunc)
    }

    setAnswer(answer) {
        if (!answer) {
            return Promise.reject('Question answer is empty')
        }
        const writeFunc = () => {
            this.answer = answer
            return Promise.resolve(answer)
        }
        return Question.writePromise(writeFunc)
    }

    insertImages(images) {
        if (!Array.isArray(images) || images.length === 0) {
            return Promise.reject("Question images is empty")
        }
        const writeFunc = () => {
            for (const picture of images) {
                this.images.push(picture)
            }
            return Promise.resolve(images)
        }
        return Question.writePromise(writeFunc)
    }

    static removeQuestion = (realm, id) => {
        const question = Question.getFromId(id)
        const writeFunc = () => {
            realm.delete(question)
            return Promise.resolve()
        }
        return Question.writePromise(writeFunc)
    }

    static removeAllQuestions = realm => {
        const questions = Question.get()
        const writeFunc = () => {
            realm.delete(questions)
            return Promise.resolve()
        }
        return Question.writePromise(writeFunc)
    }
}