export interface ConfigProps {
  name: string;
  hwang: {
    apikey: string;
  };
  csgotm: {
    apikey: string;
  };
  steam: Steam;
  discord: {
    active: boolean;
    hook: string;
  };
}

interface Steam {
  accountName: string;
  password: string;
  sharedSecret: string;
  identitySecret: string;
}
