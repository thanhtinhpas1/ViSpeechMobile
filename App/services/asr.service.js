const apiUrl = 'http://asr.vietspeech.com:5000';
import { AudioUtils } from 'react-native-audio';

export default class AsrService {
    static callAsr = ({ path }) => {
        path = `file://${AudioUtils.DocumentDirectoryPath}/audio.wav`
        const formData = new FormData()
        formData.append('voice', {
            uri: path,
            name: 'audio.wav',
            type: 'audio/wave',
        })
        const api = `${apiUrl}`
        let status = 400
        console.log(`Call asr ${api}`)
        return fetch(api, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-type': 'multipart/form-data',
            },
        })
            .then(response => {
                status = response.status
                return response.json()
            })
            .then(result => {
                // if (status !== 201) {
                //     console.log(result.message)
                // }
                return result
            })
            .catch(err => {
                console.log(err.message)
                return err.message;
            })
    }
}  