import { Injectable } from '@nestjs/common';
import { ConversationChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {
  AIMessagePromptTemplate,
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';
import { sendSms } from './sms';
import { logToSlack } from './slack.log';
import { getPaymentLink } from './payment';
import { optOutContact } from './opt-out';

interface IChat {
  from: string;
  message: string;
}

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async getUserReply(
    chat: IChat[],
    contactId: number,
    eventId: number,
    eventPrice: number,
  ) {
    chat.reverse();
    logToSlack(JSON.stringify({ chat }, null, 2));
    const model = new ChatOpenAI({
      modelName: 'gpt-4-0613',
      openAIApiKey: process.env.OPENAI_KEY,
      temperature: 0,
      streaming: true,
      timeout: 30000,
      maxConcurrency: 10,
      maxTokens: -1,
    });

    const template = chat[0].message;

    const prompt = `
    Start a back and fourth conversation with me.
    You are an AI ticket confimation agent.
    Find out how many tickets I would like to purchase for.
    Limit your response to 85 characters.
    These are the game details *${template}*
    Once the Number of tickets are gathered. ask a final confirmation of purchase, the total of each ticket is $${eventPrice}*
    Do not discuss anything if the conversation goes outside of the scope.
    Keep giving current booking status in json format, including numberOfTickets, and totalPrice, optOut.
    If user doesn't show interest, please confirm them politely if they want to opt-out for future reminders and provide 'optOut' field to be true
    `;

    const initialMessages = [SystemMessagePromptTemplate.fromTemplate(prompt)];

    const chain = new ConversationChain({
      llm: model,
      prompt: ChatPromptTemplate.fromMessages([
        ...initialMessages,
        ...chat.slice(1).map((message) => {
          if (message.from !== 'ai') {
            return AIMessagePromptTemplate.fromTemplate(message.message);
          }
          return HumanMessagePromptTemplate.fromTemplate(message.message);
        }),
        HumanMessagePromptTemplate.fromTemplate(`{input}`),
      ]),
    });

    const lastReply = chat[chat.length - 1].message;
    logToSlack(lastReply);

    const aiReply = await chain.call({
      input: lastReply,
    });

    console.log('aiReply', aiReply);

    let response = aiReply.response;
    const payloadMatch = response.match(/\{(.|\n)*\}/);
    if (payloadMatch) {
      const payloadStr = payloadMatch[0];
      logToSlack(`${payloadStr} matched`);
      response = response.replace(payloadStr, '');

      try {
        const payload = JSON.parse(payloadStr);
        if (payload.optOut) {
          // call the opt-out api for this contact
          await optOutContact(contactId);
        } else if (payload.numberOfTickets > 0) {
          const paymentLink = await getPaymentLink(
            eventId,
            contactId,
            payload.numberOfTickets,
          );
          // console.log({ paymentLink });
          response += `Here is the payment link for ${payload.numberOfTickets} tickets: <a href="${paymentLink.checkout_link.url}">Payment Link</a>`;
        }
      } catch (err) {
        logToSlack(err.message);
      }
    }
    logToSlack(JSON.stringify({ response }, null, 2));
    if (response) await sendSms(contactId, response);
    return response;
  }
}
