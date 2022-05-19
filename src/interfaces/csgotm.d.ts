export interface TradeRequestGiveResponse {
  success: boolean;
  offer: {
    partner: number;
    token: string;
    tradeoffermessage: string;
    items: Item[];
  };
}

export interface Item {
  appid: number;
  contextid: number;
  assetid: number;
  amount: number;
}
