import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const mainnetClient = new Aptos(new AptosConfig({ network: Network.MAINNET }));
const testnetClient = new Aptos(new AptosConfig({ network: Network.TESTNET }));
const devnetClient = new Aptos(new AptosConfig({ network: Network.DEVNET }));
const localClient = new Aptos(new AptosConfig({ network: Network.LOCAL }));

// Reuse same Aptos instance to utilize cookie based sticky routing
export function aptosClient(network: Network) {
  switch (network) {
    case Network.MAINNET:
      return mainnetClient;
    case Network.TESTNET:
      return testnetClient;
    case Network.DEVNET:
      return devnetClient;
    case Network.LOCAL:
      return localClient;
    default:
      throw new Error("Invalid network");
  }
}
