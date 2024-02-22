import axios from 'axios';
import { logToSlack } from './slack.log';

export const getPaymentLink = async (event_id: number, contact_id: number, quantity: number) => {
  logToSlack(`getPaymentLink -> { event_id: ${event_id}, quantity: ${quantity} }`)
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.wave.tickets/api/payment/checkout',
    headers: {
      'Content-Type': 'application/json',
    },
    data: { event_id, contact_id, quantity },
  };

  const response = await axios.request(config);
  return response.data;
};
