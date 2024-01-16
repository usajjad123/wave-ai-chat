import { Injectable } from '@nestjs/common';
import { ConversationChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {
  AIMessagePromptTemplate,
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';

interface IChat {
  from: string;
  message: string;
}

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async getUserReply(chat: IChat[], phone: string) {
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
    Once the Number of tickets are gathered. ask a final confirmation of purchase, the total of each ticket is $10.00*
    Do not discuss anything if the conversation goes outside of the scope.
    Keep giving current bookiung status in json format, including numberOfTickets, and totalPrice
    `

    const initialMessages = [
      SystemMessagePromptTemplate.fromTemplate(prompt),
    ];

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

    return await chain.call({
      input: lastReply,
    });
  }
}
