import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

const apiId = 15153052;
const apiHash = '0695062a8881222cf291fcfede909464';
const stringSession = new StringSession(''); // fill this later with the value from session.save()

export const telegram = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const main = async () => {
  await telegram.start({
    phoneNumber: async () => {
      console.log('Get phone');
      await delay(1000);
      return '123';
    },
    password: async () => {
      console.log('Get password');
      await delay(1000);
      return '123';
    },
    phoneCode: async () => {
      console.log('Get code');
      await delay(1000);
      return '123';
    },
    onError: (error) => {
      console.log(error);
    },
  });
};

main();
