import { AddPair, CreateOrder, CancelOrder, Halt, ReadOutbox } from '@verto/flex'

const functions = {
  transfer, balance
}

export async function handle(state, action) {
  if (action.input.function === 'addPair') {
    const resultObj = await AddPair(state, action)
    return { state: resultObj.state }
  }
  if (action.input.function === 'createOrder') {
    const resultObj = await CreateOrder(state, action)
    return { state: resultObj.state }
  }

  if (action.input.function === 'cancelOrder') {
    const resultObj = await CancelOrder(state, action)
    return { state: resultObj.state }
  }
  if (action.input.function === 'halt') {
    const resultObj = await Halt(state, action)
    return { state: resultObj.state }
  }

  if (action.input.function === 'readOutbox') {
    const state = await ReadOutbox(state, action)
    return { state }
  }

  try {
    const data = state

    //const data = state
    if (Object.keys(functions).includes(action.input.function)) {
      return functions[action.input.function](data, action)
    }
    throw new ContractError('Function is not found!')
  } catch (e) {
    throw new ContractError('could not validate state')
  }
}

function transfer(state, action) {
  const balances = state.balances;
  const input = action.input;
  const caller = action.caller;

  const target = input.target;
  const quantity = input.qty;

  if (!Number.isInteger(quantity) || quantity === undefined) {
    throw new ContractError(
      "Invalid value for quantity. Must be an integer."
    );
  }
  if (!target) {
    throw new ContractError("No target specified.");
  }
  if (quantity <= 0 || caller === target) {
    throw new ContractError("Invalid token transfer.");
  }
  if (balances[caller] < quantity) {
    throw new ContractError(
      "Caller balance not high enough to send " + quantity + " token(s)."
    );
  }

  balances[caller] -= quantity;
  if (target in balances) {
    balances[target] += quantity;
  } else {
    balances[target] = quantity;
  }

  return { state };
}

function balance(state, action) {
  const balances = state.balances;
  const input = action.input;
  const caller = action.caller;

  let target;
  if (!input.target) {
    target = caller;
  } else {
    target = input.target;
  }
  const ticker = state.ticker;

  if (typeof target !== "string") {
    throw new ContractError("Must specify target to get balance for.");
  }
  if (typeof balances[target] !== "number") {
    throw new ContractError("Cannot get balance; target does not exist.");
  }

  return {
    result: {
      target,
      ticker,
      balance: balances[target],
    },
  };
}
