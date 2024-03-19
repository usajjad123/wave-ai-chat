import axios from 'axios'

export const logToSlack = async (message: string) => {
    console.log("LOG_TO_SLACK", message)
    // await axios.post(process.env.SLACK_LOG_URL, { data: message })
}