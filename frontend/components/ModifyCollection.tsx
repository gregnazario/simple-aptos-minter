import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";
// Internal components
import { toast } from "@/components/ui/use-toast";
import { aptosClient } from "@/utils/aptosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CollectionData, fetchCollections, fetchTokens, TokenData } from "@/components/Collections.tsx";
import Select from "react-select";
import { NETWORK } from "@/constants.ts";
import { Image, Link } from "lucide-react";
import { LabelValueGrid } from "@/components/LabelValueGrid.tsx";

export function ModifyCollection() {
  const { account, signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient();

  const [collections, setCollections] = useState<Array<CollectionData>>([]);
  const [tokens, setTokens] = useState<Array<TokenData>>([]);
  const [collectionName, setCollectionName] = useState<string>("");
  const [name, setName] = useState<string>("Some Token Name");
  const [modifyTokenId, setModifyTokenId] = useState<string>("");
  const [uri, setUri] = useState<string>("https://media1.tenor.com/m/u5uXD3icJ1kAAAAC/simpsons-homer-simpson.gif");
  const [modifyUri, setModifyUri] = useState<string>("");
  const [description, setDescription] = useState<string>("Some Collection Description");

  useEffect(() => {
    // TODO: Refactor to only fetch the appropriate collection
    fetchCollections(account?.address).then(setCollections);
  }, [account?.address]);

  function parseCollectionNames() {
    const parsedCollections = [];
    for (let i = 0; i < collections.length; i++) {
      const col = collections[i];

      parsedCollections.push({
        collection_id: col.collection_id,
        value: col.collection_name,
        label: `${col.collection_name} (${col.collection_id})`,
      });
    }

    return parsedCollections;
  }

  function parseTokenNames() {
    const parsedTokens = [];
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];

      parsedTokens.push({
        value: tok.token_data_id,
        label: `${tok.token_name} (${tok.token_data_id})`,
      });
    }

    return parsedTokens;
  }

  async function onCollectionChange(collectionId: string) {
    const tokenData = await fetchTokens(collectionId);
    setTokens(tokenData);
  }

  function parseOneCollection() {
    if (!collectionName) {
      return <></>;
    }

    const col = collections.find((col) => col.collection_name === collectionName);
    if (!col) {
      return <div>Collection not found</div>;
    }

    return (
      <div>
        <div>{col.collection_name}</div>
        <div className="text-sm text-gray-500">{col.description}</div>
        <div className="text-sm text-blue-500">ID: {col.collection_id}</div>
        <div className="text-sm text-gray-500">Total minted: {col.total_minted_v2}</div>
        <div className="text-sm text-gray-500">Max Supply: {col.current_supply}</div>
        <div className="text-sm text-gray-500">Last change time: {col.last_transaction_timestamp}</div>
        <div className="text-sm text-gray-500">
          <a href={`https://aptoscan.com/tokenv2/${col.collection_id}?network=${NETWORK}`}>
            See on AptoScan <Link size={18} />
          </a>
        </div>
        <div className="text-sm text-gray-500">
          <a href={`https://explorer.aptoslabs.com/object/${col.collection_id}?network=${NETWORK}`}>
            See on Aptos Explorer
            <Link size={18} />
          </a>
        </div>
        <div> {col?.uri ? <img src={col.uri} /> : <Image />}</div>
      </div>
    );
  }

  function parseTokenData() {
    const parsedTokens: any[] = [];
    if (!tokens) {
      return parsedTokens;
    }

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];

      parsedTokens.push({
        key: tok.token_data_id,
        label: (
          <div>
            <div>{tok.token_name}</div>
            <div className="text-sm text-blue-500">ID: {tok.token_data_id}</div>
            <div> {tok?.token_uri ? <img src={tok.token_uri} /> : <Image />}</div>
          </div>
        ),
        // TODO: make prettier
        value: (
          <div>
            <div className="text-sm text-gray-500">
              <a href={`https://aptoscan.com/tokenv2/${tok.token_data_id}?network=${NETWORK}`}>
                See on AptoScan <Link size={18} />
              </a>
            </div>
            <div className="text-sm text-gray-500">
              <a href={`https://explorer.aptoslabs.com/token/${tok.token_data_id}?network=${NETWORK}`}>
                See on Aptos Explorer
                <Link size={18} />
              </a>
            </div>
          </div>
        ),
      });
    }

    return parsedTokens;
  }

  const onMintButton = async () => {
    if (!account) {
      return;
    }

    try {
      const committedTransaction = await signAndSubmitTransaction({
        data: {
          function: "0x4::aptos_token::mint",
          typeArguments: [],
          functionArguments: [collectionName, description, name, uri, [], [], []],
        },
      });
      const executedTransaction = await aptosClient().waitForTransaction({
        transactionHash: committedTransaction.hash,
      });
      // TODO: Fix collection query for invalidation
      await queryClient.invalidateQueries();
      toast({
        title: "Success",
        description: `Transaction succeeded, hash: ${executedTransaction.hash}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const onImageChange = async () => {
    if (!account) {
      return;
    }

    try {
      const committedTransaction = await signAndSubmitTransaction({
        data: {
          function: "0x4::aptos_token::set_uri",
          typeArguments: ["0x4::aptos_token::AptosToken"],
          functionArguments: [modifyTokenId, modifyUri],
        },
      });
      const executedTransaction = await aptosClient().waitForTransaction({
        transactionHash: committedTransaction.hash,
      });
      // TODO: Fix collection query for invalidation
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
      <Select
        options={parseCollectionNames()}
        onChange={(e) => {
          setCollectionName(e?.value ?? "");
          onCollectionChange(e?.collection_id ?? "");
        }}
      ></Select>
      {parseOneCollection()}
      <LabelValueGrid items={parseTokenData()} />
      <h4 className="text-lg font-medium">Mint Token</h4>
      Name <Input disabled={!account} defaultValue={name} onChange={(e) => setName(e.target.value)} />
      Description{" "}
      <Input disabled={!account} defaultValue={description} onChange={(e) => setDescription(e.target.value)} />
      URI <Input disabled={!account} defaultValue={uri} onChange={(e) => setUri(e.target.value)} />
      <Button disabled={!account} onClick={onMintButton}>
        Mint Token
      </Button>
      <h4 className="text-lg font-medium">Change Token Image</h4>
      <Select
        options={parseTokenNames()}
        onChange={(e) => {
          setModifyTokenId(e?.value ?? "");
        }}
      ></Select>
      New URI <Input disabled={!account} defaultValue={""} onChange={(e) => setModifyUri(e.target.value)} />
      <Button disabled={!account} onClick={onImageChange}>
        Set Token Image
      </Button>
    </div>
  );
}
