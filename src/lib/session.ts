import PocketBase from 'pocketbase';
import type { Session, SessionWithUser } from 'src/lib/types';

const pb = new PocketBase('https://pocketbase-malakhov.fly.dev');

export const getOrCreateSession = async (
  chat_id: string,
  profile_telegram_id: string,
  profile_id: string,
  omit_create = false,
): Promise<Session> => {
  const userMe = await pb.collection('profiles').getOne(profile_id);
  let companionUser = await pb
    .collection('profiles')
    .getFirstListItem(`telegram_id="${chat_id}"`)
    .catch(() => null);

  if (!companionUser) {
    console.log('create new companion user');

    companionUser = await pb.collection('profiles').create({
      telegram_id: chat_id,
    });
  }

  let session;
  const mySessions = await pb.collection('sessions').getFullList<SessionWithUser>({
    expand: 'users',
    filter: `users.telegram_id ?= "${userMe.telegram_id}"`,
    sort: '-created',
    perPage: 1000,
  });

  console.log('my sessions: ', mySessions, chat_id, userMe.telegram_id);

  session = mySessions.find((i) => i.expand.users.find((j) => j.telegram_id === chat_id));

  console.log('match with companionUser id: ', session);

  if (!session && !omit_create) {
    console.log('create new session');

    session = await pb.collection('sessions').create({
      users: [userMe.id, companionUser.id],
    });
    console.log('new session: ', session);
  }

  return session;
};
