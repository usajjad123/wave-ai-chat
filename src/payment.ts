import axios from 'axios';

export const getPaymentLink = async (event_id: number, quantity: number) => {
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.wave.tickets/api/payment/checkout',
    headers: {
      'Content-Type': 'application/json',
    },
    data: { event_id, quantity },
  };

  const response = await axios.request(config);
  return response.data;
};
