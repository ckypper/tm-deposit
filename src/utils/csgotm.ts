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
