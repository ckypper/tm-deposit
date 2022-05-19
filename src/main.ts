import { USER_CONFIG } from './config/index';
import { initCsgoTMSocket } from './csgotm';
import { timeout } from './utils';
import { loginSteam } from './utils/steam';

const main = () => {
  initUser();
};

const initUser = async () => {
  for (let i = 0; i < USER_CONFIG.length; i++) {
    await loginSteam(USER_CONFIG[i]);
    initCsgoTMSocket(USER_CONFIG[i]);
    await timeout(10000);
  }
};

main();
