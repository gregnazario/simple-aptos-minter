import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";
// Internal components
import { toast } from "@/components/ui/use-toast";
import { aptosClient } from "@/utils/aptosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateCollection() {
  const { account, signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient();

  const [name, setName] = useState<string>("Some Collection Name");
  const [uri, setUri] = useState<string>("https://media1.tenor.com/m/u5uXD3icJ1kAAAAC/simpsons-homer-simpson.gif");
  const [description, setDescription] = useState<string>("Some Collection Description");
  const [supply, setSupply] = useState<number>(100);

  const onClickButton = async () => {
    if (!account) {
      return;
    }

    try {
      const committedTransaction = await signAndSubmitTransaction({
        data: {
          function: "0x4::aptos_token::create_collection",
          typeArguments: [],
          functionArguments: [
            description,
            supply, // max supply
            name,
            uri,
            true, // Mutable description
            true, // Mutable royalty
            true, // Mutable uri
            true, // Mutable token description
            true, // Mutable token name
            true, // Mutable token properties
            true, // Mutable token uri
            true, // Tokens burnable by creator
            true, // Tokens freezable by creator
            1, // Royalty numerator
            100, // Royalty denominator
          ],
        },
      });
      const executedTransaction = await aptosClient().waitForTransaction({
        transactionHash: committedTransaction.hash,
      });
      await queryClient.invalidateQueries();
      toast({
        title: "Success",
        description: `Transaction succeeded, hash: ${executedTransaction.hash}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h4 className="text-lg font-medium">Create Collection</h4>
      Name <Input disabled={!account} defaultValue={name} onChange={(e) => setName(e.target.value)} />
      Description{" "}
      <Input disabled={!account} defaultValue={description} onChange={(e) => setDescription(e.target.value)} />
      URI <Input disabled={!account} defaultValue={uri} onChange={(e) => setUri(e.target.value)} />
      Max supply{" "}
      <Input disabled={!account} defaultValue={supply} onChange={(e) => setSupply(parseInt(e.target.value, 10))} />
      <Button disabled={!account} onClick={onClickButton}>
        Create Collection
      </Button>
    </div>
  );
}
