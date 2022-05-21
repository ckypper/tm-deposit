import { ConfigProps } from './interfaces';
import { client } from 'websocket';
import { getTradeRequest, getWsAuth, ping } from './utils/csgotm';
import { sendOffer } from './utils/steam';
import { message, Status } from './utils/message';
import { timeout } from './utils';

const sellingItem: { id: string; name: string }[] = [];
let pingAPIInterval = null;
let pingWSInterval = null;

export const initCsgoTMSocket = async (config: ConfigProps) => {
  const socket = new client();

  socket.on('connectFailed', function (error) {
    console.log('Connect Error: ' + error.toString());
  });

  socket.on('connect', async function (connection) {
    const key = await getWsAuth(config);
    if (key) {
      connection.send(key.wsAuth);
      connection.send('history_go');
      message(config, 'Websocket Client Connected', Status.SUCCESS);
      ping(config);
      pingAPIInterval = setInterval(() => ping(config), 180000);
      pingWSInterval = setInterval(() => {
        connection.send('ping');
      }, 45000);
    }
    connection.on('error', function (error) {
      console.log('Connection Error: ' + error.toString());
    });
    connection.on('close', function () {
      console.log('Socket is closed. Reconnect will be attempted in 1 second.');
      clearInterval(pingAPIInterval);
      clearInterval(pingWSInterval);
      initCsgoTMSocket(config);
    });
    connection.on('message', function (message) {
      if (message.type === 'utf8') {
        try {
          const jsonParse = JSON.parse(message.utf8Data);
          const dataParse = JSON.parse(jsonParse.data);
          switch (jsonParse.type) {
            case 'itemout_new_go':
              onSellingItem(
                config,
                dataParse.ui_asset,
                dataParse.i_market_hash_name,
                dataParse.ui_price,
                dataParse.ui_id,
              );
              break;
            case 'itemstatus_go':
              onFulfilledItem(config, dataParse.id, dataParse.status);
              break;
          }
        } catch (error) {}
      }
    });
  });

  socket.connect('wss://wsnn.dota2.net/wsn/');
};

const onFulfilledItem = async (config: ConfigProps, id: number, status: number) => {
  const item = sellingItem.find((item) => item.id === id.toString());
  if (item) {
    switch (status) {
      case 5:
        message(config, `Selling ${item.name} successfully`, Status.SUCCESS);
        break;
      case 6:
        message(config, `Buyer not accept ${item.name}`, Status.FAILED);
        break;
    }
  }
};

const onSellingItem = async (config: ConfigProps, assetid: string, name: string, price: number, tm_id: string) => {
  sellingItem.push({ id: tm_id, name });
  message(config, `Someone buying your ${name} for ${price}$`, Status.SUCCESS);
  await timeout(30000);
  const tradeRequest = await getTradeRequest(config);

  if (tradeRequest && tradeRequest.success) {
    const findOffer = tradeRequest.offers.find((offer) => offer.items.some((item) => item.assetid.toString() === assetid));
    if (findOffer) {
      sendOffer(
        config,
        findOffer.items,
        `https://steamcommunity.com/tradeoffer/new/?partner=${findOffer.partner}&token=${findOffer.token}`,
        findOffer.tradeoffermessage,
      );
    } else {
      message(config, `Cannot find ${name} in csgotm list offer`, Status.FAILED);
    }
  } else {
    message(config, `Cannot get csgotm list offer`, Status.FAILED);
  }
};
