export interface StateInterface {
  ticker: string;
  reserve: string;
  balances: {
    [addr: string]: number;
  };
  invocations: string[];
}

export interface BalanceInterface {
  target: string;
  balance: number;
  ticker: string;
}

export interface ActionInterface {
  input: InputInterface;
  caller: string;
}

export interface InputInterface {
  function: "mint" | "transfer" | "balance" | "readOutbox";
  target?: string;
  qty?: number;
  contract?: string;
}

export interface ForeignCallInterface {
  txID: string;
  contract: string;
  input: any;
};
