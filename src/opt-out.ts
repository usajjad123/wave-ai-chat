import axios from 'axios';

export const optOutContact = async (contactId: number) => {
  const data = JSON.stringify({
    contact_id: contactId,
  });

  const response = await axios.request({
    method: 'post',
    url: `${process.env.SERVER_URL}/api/contact/opt-out`,
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
  return response.data;
};
