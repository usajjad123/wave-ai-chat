import axios from 'axios'

export const sendSms = async (contactId: number, message: string) => {
  const data = JSON.stringify({
    contact_id: contactId,
    message
  });


  const response = await axios.request({
    method: 'post',
    maxBodyLength: Infinity,
    url: `${process.env.SERVER_URL}/api/send-message`,
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
  return response.data
}