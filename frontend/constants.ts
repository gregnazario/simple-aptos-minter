export let NETWORK = import.meta.env.VITE_APP_NETWORK ?? "testnet";
export const MODULE_ADDRESS = import.meta.env.VITE_MODULE_ADDRESS;

export function updateNetwork(network: string) {
  NETWORK = network;
}
