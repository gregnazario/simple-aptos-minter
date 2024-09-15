import { aptosClient } from "@/utils/aptosClient";
import { Network } from "@aptos-labs/ts-sdk";

export type AccountAPTBalanceArguments = {
  accountAddress: string;
};

export const getAccountAPTBalance = async (
  expectedNetwork: Network,
  args: AccountAPTBalanceArguments,
): Promise<number> => {
  const { accountAddress } = args;
  const balance = await aptosClient(expectedNetwork).view<[number]>({
    payload: {
      function: "0x1::coin::balance",
      typeArguments: ["0x1::aptos_coin::AptosCoin"],
      functionArguments: [accountAddress],
    },
  });
  return balance[0];
};
