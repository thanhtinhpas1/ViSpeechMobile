import { SCHEMA } from "../../utils/constants.util";

// const levelList = ['Dễ', 'Trung bình', 'Khó']

export default class Level {
    static schema = {
        name: SCHEMA.LEVEL,
        primaryKey: 'id',
        properties: {
            id: { type: 'int' },
            name: { type: 'string' },
            value: { type: 'int' },
            createdDate: { type: 'date', default: new Date() }
        }
    }

    static createLevel = (realm, name, value) => {
        if (!name) {
            return Promise.reject('Level name is empty')
        }
        const data = {
            id: Level.getPrimaryKeyId(),
            name,
            value,
        }
        console.log('Level [createLevel] data: ', data)
        const writeFunc = () => { 
            realm.create(Level.getSchemaName(), data, true)
            return Promise.resolve(data)
        }
        return Level.writePromise(writeFunc)
    }

    static createLevels = async (realm, levels) => {
        try {
            if (!Array.isArray(levels) || levels.length === 0) {
                return Promise.reject("Level list is empty")
            }
            for (const level of levels) {
                await Level.createLevel(realm, level.name, level.value)
            }
            return Promise.resolve(levels)
        } catch (e) {
            return Promise.reject(e)
        }
    }
}