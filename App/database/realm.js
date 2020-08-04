import Realm from 'realm'
import RNFS from 'react-native-fs'
import { DB_PATH } from '../utils/constants.util'
import * as TopicsData from './initialData/topics.json'
import * as LevelsData from './initialData/levels.json'
import Topic from './schemas/topic.schema'
import schemas from './schemas'
import Level from './schemas/level.schema'

const databaseOptions = {
    path: DB_PATH,
    schema: schemas,
    schemaVersion: 0
}
const realm = new Realm(databaseOptions)

schemas.forEach(ObjectType => {
    ObjectType.getSchemaName = () => {
        return ObjectType.schema.name
    }

    ObjectType.getSchemaPrimaryKey = () => {
        return ObjectType.schema.primaryKey
    }

    const schemaName = ObjectType.getSchemaName()
    const schemaPrimaryKey = ObjectType.getSchemaPrimaryKey()

    ObjectType.get = () => {
        return realm.objects(schemaName)
    }

    ObjectType.filter = query => {
        return realm.objects(schemaName).filtered(query)
    }

    ObjectType.hasProperty = property => {
        return ObjectType.schema.properties[property] != null
    }

    ObjectType.sortByProperty = (data, property, isDesc = false) => {
        if (ObjectType.hasProperty(property)) {
            return data.sorted(property, isDesc)
        }
        return []
    }

    ObjectType.getFromId = id => {
        return realm.objectForPrimaryKey(schemaName, id)
    }

    ObjectType.getPrimaryKeyId = () => {
        const maxPrimaryKey = realm.objects(schemaName).max(schemaPrimaryKey)
        if (maxPrimaryKey) {
            return maxPrimaryKey + 1
        }
        return 1
    }

    ObjectType.writePromise = callback => {
        try {
            realm.write(callback)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    // your common realm methods here like inserts, updates, etc.
    // ...
})

const createDB = async () => {
    try {
        console.log("Creating DB")
        console.log("DB path:" + realm.path)

        await Level.createLevels(realm, LevelsData.levels)
        const easyLevel = Level.filter('name = "Dễ"')
        const hardLevel = Level.filter('name = "Khó"')
        console.log("easyLevel ", easyLevel)
        console.log("hardLevel ", hardLevel)

        for (let topic of TopicsData.topics) {
            for (let lesson of topic.lessons) {
                lesson.levelLessons = lesson.levelLessons.map(levelLesson => {
                    return {
                        ...levelLesson,
                        level: levelLesson.level === "easy" ? easyLevel[0] : hardLevel[0]
                    }
                })
            }
            console.log("topic ", topic)
            await Topic.createTopic(realm, topic.name, topic.image, topic.lessons)
            console.log("done creating topic ", topic)
        }
    } catch (error) {
        console.log("Error on initializing data")
        console.log(error)
    }
};

export const openDB = () => {
    console.log("Open DB")
    console.log("RNFS ", RNFS.DocumentDirectoryPath)
        if (Topic.get().length === 0) {
            createDB()
        }
}

export default realm