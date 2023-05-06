import { tg } from 'src/popup/telegram';

export async function getUser() {
  try {
    const user = await tg.call('users.getFullUser', {
      id: {
        _: 'inputUserSelf',
      },
    });

    return user;
  } catch (error) {
    return null;
  }
}

export function sendCode(phone) {
  return tg.call('auth.sendCode', {
    phone_number: phone,
    settings: {
      _: 'codeSettings',
    },
  });
}

export function signIn({ code, phone, phone_code_hash }) {
  return tg.call('auth.signIn', {
    phone_code: code,
    phone_number: phone,
    phone_code_hash: phone_code_hash,
  });
}

export function signUp({ phone, phone_code_hash }) {
  return tg.call('auth.signUp', {
    phone_number: phone,
    phone_code_hash: phone_code_hash,
    first_name: 'MTProto',
    last_name: 'Core',
  });
}

export function getPassword() {
  return tg.call('account.getPassword');
}

export function checkPassword({ srp_id, A, M1 }) {
  return tg.call('auth.checkPassword', {
    password: {
      _: 'inputCheckPasswordSRP',
      srp_id,
      A,
      M1,
    },
  });
}

export const signInUser = async () => {
  const user = await getUser();

  const phone = '+9996614321';
  const code = '123123';

  if (!user) {
    const { phone_code_hash } = await sendCode(phone);
    console.log(`phone_code_hash:`, phone_code_hash);

    try {
      const signInResult = await signIn({
        code,
        phone,
        phone_code_hash,
      });

      console.log(`signInResult:`, signInResult);

      if (signInResult._ === 'auth.authorizationSignUpRequired') {
        await signUp({
          phone,
          phone_code_hash,
        });
      }
    } catch (error) {
      if (error.error_message !== 'SESSION_PASSWORD_NEEDED') {
        console.log(`error:`, error);

        return;
      }

      // 2FA

      const password = 'USER_PASSWORD';

      const { srp_id, current_algo, srp_B } = await getPassword();
      const { g, p, salt1, salt2 } = current_algo;

      const { A, M1 } = await tg.mtproto.crypto.getSRPParams({
        g,
        p,
        salt1,
        salt2,
        gB: srp_B,
        password,
      });

      const checkPasswordResult = await checkPassword({ srp_id, A, M1 });
      console.log(`checkPasswordResult:`, checkPasswordResult);
    }
  }

  return user;
};
