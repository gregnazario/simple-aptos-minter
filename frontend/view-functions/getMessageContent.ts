import { MODULE_ADDRESS } from "@/constants";
import { aptosClient } from "@/utils/aptosClient";
import { Network } from "@aptos-labs/ts-sdk";

export const getMessageContent = async (expectedNetwork: Network): Promise<string> => {
  const content = await aptosClient(expectedNetwork)
    .view<[string]>({
      payload: {
        function: `${MODULE_ADDRESS}::message_board::get_message_content`,
      },
    })
    .catch((error) => {
      console.error(error);
      return ["message not exist"];
    });

  return content[0];
};
