import axios from 'axios'

export const logToSlack = async (message: string) => {
    await axios.post(process.env.SLACK_LOG_URL, { data: message })
}