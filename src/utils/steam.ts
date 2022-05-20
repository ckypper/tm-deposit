import { ConfigProps } from '../interfaces';
import SteamCommunity from 'steamcommunity';
import TradeOfferManager from 'steam-tradeoffer-manager';
import SteamTotp from 'steam-totp';
import { message, Status } from './message';
import { timeout } from '.';
import { Item } from '../interfaces/csgotm';

const steamManager = {};

const retryAttempt = 3;
const retryTimeout = 0.5; //minutes;

const sendProcess = async (config: ConfigProps, items: Item[], tradeUrl: string, retry: number, msg?: string) => {
  const manager = steamManager[config.steam.accountName].manager;
  const offer = manager.createOffer(tradeUrl);
  offer.addMyItems(items);
  if (msg) {
    offer.setMessage(msg);
  }
  try {
    await send(offer);
    message(config, `Create offer successfully`, Status.SUCCESS);
    return offer;
  } catch (error) {
    if (retry === retryAttempt) {
      message(config, `Create offer failed in ${retryAttempt} times. Ignore the trade`, Status.FAILED);
    } else {
      message(config, `Create offer failed. Retry in ${retryTimeout} minute`, Status.FAILED);
      await loginSteam(config);
      await timeout(retryTimeout * 60000);
      return await sendProcess(config, items, tradeUrl, retry + 1, msg);
    }
  }
};

const confirmProcess = async (config: ConfigProps, offer, items: Item[], retry: number) => {
  try {
    const steam = steamManager[config.steam.accountName].steam;
    await confirm(offer, config.steam.identitySecret, steam);
    message(config, `Confirm offer successfully`, Status.SUCCESS);
  } catch (error) {
    console.log(error, error.response);
    if (retry === retryAttempt) {
      message(config, `Confirm offer failed in ${retryAttempt} times. Ignore the trade`, Status.FAILED);
    } else {
      message(config, `Confirm offer failed. Retry in ${retryTimeout} minute`, Status.FAILED);
      await loginSteam(config);
      await timeout(retryTimeout * 60000);
      return await confirmProcess(config, offer, items, retry + 1);
    }
  }
};

export const sendOffer = async (config: ConfigProps, items: Item[], tradeurl: string, message?: string) => {
  const offer = await sendProcess(config, items, tradeurl, 1, message);
  if (offer) {
    await timeout(10000);
    await confirmProcess(config, offer, items, 1);
  }
};

const confirm = (offer, identitySecret, steam) => {
  return new Promise((resolve, reject) => {
    steam.acceptConfirmationForObject(identitySecret, offer.id, (err) => {
      if (err) {
        reject(err);
      }

      resolve(null);
    });
  });
};

const send = (offer) => {
  return new Promise((resolve, reject) => {
    offer.send((err, status) => {
      if (err) {
        reject(err);
        return;
      }

      if (status === 'pending') {
        resolve(null);
      }
    });
  });
};

export const loginSteam = async (config: ConfigProps) => {
  return new Promise((resolve) => {
    const steam = new SteamCommunity();
    steam.login(
      {
        accountName: config.steam.accountName,
        password: config.steam.password,
        twoFactorCode: SteamTotp.getAuthCode(config.steam.sharedSecret),
      },
      (err, sessionID, cookies, steamguard) => {
        if (err) {
          resolve(null);
          message(config, 'Steam login failed', Status.FAILED);
          return;
        }

        steamManager[config.steam.accountName] = {
          steam: steam,
          manager: new TradeOfferManager({
            domain: 'localhost',
            language: 'en',
            pollInterval: 120000,
            // cancelTime: 9 * 60 * 1000, // cancel outgoing offers after 9mins
          }),
        };

        steamManager[config.steam.accountName].manager.setCookies(cookies, (err) => {
          if (err) {
            resolve(null);
            message(config, 'Steam login failed', Status.FAILED);
            steamManager[config.steam.accountName] = null;
            return;
          }

          // auto accept steam offer
          steamManager[config.steam.accountName].manager.on('newOffer', (offer) => {
            if (offer.itemsToGive.length === 0) {
              offer.accept();
            }
          });

          message(config, 'Steam login successfully', Status.SUCCESS);
          resolve(null);
        });
      },
    );
  });
};
