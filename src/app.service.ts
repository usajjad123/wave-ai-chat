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

  async getUserReply(chat: IChat[]) {
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

    const initialMessages = [
      SystemMessagePromptTemplate.fromTemplate(template),
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
