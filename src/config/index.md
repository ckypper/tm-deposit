```js
import { ConfigProps } from '../interfaces/index';

export const USER_CONFIG: ConfigProps[] = [
  {
    name: 'John', // To display in message
    csgotm: {
      apikey: 'abcxyz', // CSGOTM APIKey, you can find in https://market.csgo.com/docs-v2,
    },
    steam: {
      accountName: 'abcxyz', // steam account
      password: 'abcxyz', // steam password
      identitySecret: 'abcxyz', // steam identitySecret
      sharedSecret: 'abcxyz', // steam sharedSecret
    },
    discord: {
      active: true, // if true, send log message to discord hook
      hook: 'aaaaaaaa', // discord hook
    },
  },
];
```
