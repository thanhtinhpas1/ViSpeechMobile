export const Utils = {
    sort: (arr, property, isAsc = true) => {
        if (!Array.isArray(arr)) {
            return []
        }

        const result = [...arr]
        const sortFunc = isAsc ? (a, b) => a[property] - b[property] : (a, b) => b[property] - a[property]
        return result.sort(sortFunc)
    },
    sortByFunc: (arr, sortFunc) => {
        if (!Array.isArray(arr) || arr.length === 0) {
            return []
        }

        const result = [...arr]
        return result.sort(sortFunc)
    }
}