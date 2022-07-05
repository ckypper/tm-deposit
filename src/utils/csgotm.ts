import axios from 'axios';
import { message, Status } from './message';
import { ConfigProps } from '../interfaces';
import { TradeRequestGiveResponse } from '../interfaces/csgotm';

export const getWsAuth = async (config: ConfigProps) => {
  try {
    const url = `https://market.csgo.com/api/v2/get-ws-auth?key=${config.csgotm.apikey}`;
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    message(config, `Cannot get ws auth key due to ${error.message}`, Status.FAILED);
    return null;
  }
};

export const getTradeRequest = async (config: ConfigProps) => {
  try {
    const url = `https://market.csgo.com/api/v2/trade-request-give-p2p-all?key=${config.csgotm.apikey}`;
    const { data } = await axios.get<TradeRequestGiveResponse>(url);
    return data;
  } catch (error) {
    message(config, `Cannot get ws auth key due to ${error.message}`, Status.FAILED);
    return null;
  }
};

export const ping = async (config: ConfigProps) => {
  try {
    const url = `https://market.csgo.com/api/v2/ping?key=${config.csgotm.apikey}`;
    const { data } = await axios.get<TradeRequestGiveResponse>(url);
  } catch (error) {
    message(config, `Ping failed`, Status.FAILED, true);
  }
};

export const noteHwangTrade = async (config: ConfigProps, assetId: string, price: number) => {
  if (assetId === '0') {
    message(config, `Note sold item failed due to assetid = 0`, Status.FAILED);
    return null;
  }

  try {
    const url = `https://hwang-trade.vercel.app/api/item-trading/sell`;
    await axios.post(
      url,
      {
        asset_id: assetId,
        sold_price: price,
        sold_site: 'csgotm',
      },
      {
        headers: {
          'x-api-key': config.hwang.apikey,
        },
      },
    );
    message(config, `Note sold item successfully`, Status.SUCCESS);
    return true;
  } catch (error) {
    message(config, `Note sold item failed due to ${error.message}`, Status.FAILED);
    return null;
  }
};

export const relistItem = async (config: ConfigProps, assetId: string, price: number, name: string) => {
  if (assetId === '0') {
    message(config, `Relist item failed due to assetid = 0`, Status.FAILED);
    return null;
  }

  try {
    await reloadInventory(config);
    const { data } = await axios.get('https://market.csgo.com/api/v2/add-to-sale', {
      params: {
        key: config.csgotm.apikey,
        price: price * 1000,
        cur: 'USD',
        id: assetId,
      },
    });

    if (data.success) {
      message(config, `Relist item ${name} successfully with price: ${price}$`, Status.SUCCESS);
    } else {
      throw new Error(data.error);
    }
    return true;
  } catch (error) {
    message(config, `Relist item failed due to ${error.message}`, Status.FAILED);
    return null;
  }
};

export const reloadInventory = async (config: ConfigProps) => {
  try {
    const { data } = await axios.get('https://market.csgo.com/api/v2/update-inventory', {
      params: {
        key: config.csgotm.apikey,
      },
    });

    return true;
  } catch (error) {
    return null;
  }
};
