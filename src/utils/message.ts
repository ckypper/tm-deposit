import { COLOR } from '../constant';
import { ConfigProps } from '../interfaces/index';
import dayjs from 'dayjs';
import axios from 'axios';

export enum Status {
  FAILED,
  SUCCESS,
}

export const message = (config: ConfigProps, message: string, status: Status) => {
  const { name } = config;
  const formatMessage = `[${name} - ${dayjs(new Date()).format('DD/MM/YYYY HH:mm:ss')}] ${message}`;
  switch (status) {
    case Status.FAILED:
      console.log(`${COLOR.FgRed}${formatMessage}`, COLOR.FgWhite);
      break;
    case Status.SUCCESS:
      console.log(`${COLOR.FgGreen}${formatMessage}`, COLOR.FgWhite);
      break;
    default:
      console.log(`${COLOR.FgGreen}${formatMessage}`, COLOR.FgWhite);
      break;
  }

  if (config.discord.active) {
    axios.post(config.discord.hook, {
      content: `${formatMessage}`,
    });
  }
};
