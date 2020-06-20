import { SCHEMA } from "../../utils/constants.util"
import Lesson from "./lesson.schema"

export default class Topic {
    static schema = {
        name: SCHEMA.TOPIC,
        primaryKey: 'id',
        properties: {
            id: { type: 'int' },
            name: { type: 'string' },
            image: { type: 'string' },
            isFinished: { type: 'bool', default: false },
            totalCompletedLessons: { type: 'int', default: 0 },
            totalLessons: { type: 'int', default: 0 },
            lessons: { type: 'list', objectType: 'Lesson' },
            createdDate: { type: 'date', default: new Date() }
        }
    }

    static createTopic = (realm, name, image, lessons) => {
        if (!name || !image) {
            return Promise.reject('Topic name or image is empty')
        }
        if (!Array.isArray(lessons) || lessons.length === 0) {
            return Promise.reject("Topic's lessons is empty")
        }
        const data = {
            id: Topic.getPrimaryKeyId(),
            name,
            image,
            lessons,
            totalLessons: lessons.length,
        }
        console.log('Topic [createTopic] data: ', data)
        const writeFunc = () => { 
            realm.create(Topic.getSchemaName(), data, true) 
            return Promise.resolve(data)
        }
        return Topic.writePromise(writeFunc)
    }

    static createTopics = async (realm, topics) => {
        try {
            if (!Array.isArray(topics) || topics.length === 0) {
                return Promise.reject("Topic list is empty")
            }
            for (const topic of topics) {
                const { name, image, lessons } = topic
                await Topic.createTopic(realm, name, image, lessons)
            }
            return Promise.resolve(topics)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    setName(name) {
        if (!name) {
            return Promise.reject('Topic name is empty')
        }
        const writeFunc = () => { 
            this.name = name 
            return Promise.resolve(name)
        }
        return Topic.writePromise(writeFunc)
    }

    setImage(imageUrl) {
        if (!imageUrl) {
            return Promise.reject('Topic imageUrl is empty')
        }
        const writeFunc = () => { 
            this.image = imageUrl 
            return Promise.resolve(imageUrl)
        }
        return Topic.writePromise(writeFunc)
    }

    setIsFinished() {
        const writeFunc = () => {
            const finished = this.totalCompletedLessons === this.totalLessons ? true : false
            this.isFinished = finished
            console.log(`Topic [setIsFinished]: ${finished}`)
            return Promise.resolve(finished)
        }
        return Topic.writePromise(writeFunc)
    }

    setTotalCompletedLessons(totalCompletedLessons) {
        if (totalCompletedLessons == null || totalCompletedLessons < 0) {
            return Promise.reject("Topic's totalCompletedLessons is invalid")
        }
        const writeFunc = () => {
            this.totalCompletedLessons = totalCompletedLessons
            console.log(`Topic [setTotalCompletedLessons]: ${totalCompletedLessons}`)
            return Promise.resolve(totalCompletedLessons)
        }
        return Topic.writePromise(writeFunc)
    }

    insertLessons(lessons) {
        if (!Array.isArray(lessons) || lessons.length === 0) {
            return Promise.reject("Topic's lessons is empty")
        }
        const writeFunc = () => {
            for (const lesson of lessons) {
                this.lessons.push(lesson)
            }
            return Promise.resolve(lessons)
        }
        return Topic.writePromise(writeFunc)
    }

    static addLessonsToTopic = (id, lessons) => {
        if (id == null) {
            return Promise.reject('Topic id is empty')
        }
        if (!Array.isArray(lessons) || lessons.length === 0) {
            return Promise.reject("Topic's lessons is empty")
        }

        const topic = Topic.getFromId(id)
        const writeFunc = () => {
            for (const lesson of lessons) {
                topic.lessons.push(lesson)
            }
            return Promise.resolve(topic)
        }
        return Topic.writePromise(writeFunc)
    }

    static removeTopic = (realm, id) => {
        const topic = Topic.getFromId(id)
        const writeFunc = async () => {
            await Lesson.removeLessonsByTopicId(realm, topic.id)
            realm.delete(topic)
            return Promise.resolve()
        }
        return Topic.writePromise(writeFunc)
    }

    static removeAllTopics = realm => {
        const topics = Topic.get()
        const writeFunc = async () => {
            for (const topic of topics) {
                await Lesson.removeLessonsByTopicId(realm, topic.id)
            }
            realm.delete(topics)
            return Promise.resolve()
        }
        return Topic.writePromise(writeFunc)
    }
}