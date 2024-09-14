import { useWallet } from "@aptos-labs/wallet-adapter-react";
// Internal components
import { LabelValueGrid } from "@/components/LabelValueGrid";
import { aptosClient } from "@/utils/aptosClient.ts";
import { useEffect, useState } from "react";
import { AccountAddress } from "@aptos-labs/ts-sdk";
import { Link } from "lucide-react";
import { NETWORK } from "@/constants.ts";

export const GetTokenData = `
query GetTokensDataByName($where_condition: current_token_datas_v2_bool_exp!) {
  current_token_datas_v2(where: $where_condition) {
    token_name
    description
    token_uri
    token_data_id
    current_token_ownerships {
      owner_address
    }
  }
}`;

export const GetCollectionData = `
    query getCollectionData($where_condition: current_collections_v2_bool_exp!) {
  current_collections_v2(where: $where_condition) {
    uri
    total_minted_v2
    max_supply
    collection_id
    collection_name
    creator_address
    current_supply
    description
    last_transaction_timestamp
  }
}
`;
export type GetTokenDataQuery = {
  current_token_datas_v2: Array<TokenData>;
};

export type GetCollectionDataQuery = {
  current_collections_v2: Array<CollectionData>;
};

export type TokenData = {
  token_name: string;
  description: string;
  token_uri: string;
  token_data_id: string;
  current_token_ownerships: {
    owner_address: string;
  };
};

export type CollectionData = {
  uri: string;
  total_minted_v2: any | null;
  max_supply: any | null;
  collection_id: string;
  collection_name: string;
  creator_address: string;
  current_supply: any;
  description: string;
  last_transaction_timestamp: any;
  last_transaction_version: any;
};

export async function fetchCollections(creatorAddress: string | null | undefined) {
  if (!creatorAddress) {
    return [];
  }

  const address = AccountAddress.fromString(creatorAddress);
  const client = aptosClient();

  const whereCondition: any = {
    creator_address: { _eq: address.toStringLong() },
    token_standard: { _eq: "v2" },
  };

  // Hmm... for some reason we don't list all collections by creator address, or expose it
  // TODO: add pagination
  const graphqlQuery = {
    query: GetCollectionData,
    variables: {
      where_condition: whereCondition,
    },
  };
  const data = await client.queryIndexer<GetCollectionDataQuery>({
    query: graphqlQuery,
  });
  return data.current_collections_v2;
}

export async function fetchTokens(collectionId: string | null | undefined) {
  if (!collectionId) {
    return [];
  }

  const client = aptosClient();

  const whereCondition: any = {
    collection_id: { _eq: collectionId },
  };

  // TODO: add pagination
  const graphqlQuery = {
    query: GetTokenData,
    variables: {
      where_condition: whereCondition,
    },
  };
  const data = await client.queryIndexer<GetTokenDataQuery>({
    query: graphqlQuery,
  });
  return data.current_token_datas_v2;
}

export function Collections() {
  const { account } = useWallet();
  const [collections, setCollections] = useState<Array<CollectionData>>([]);

  useEffect(() => {
    fetchCollections(account?.address).then(setCollections);
  }, [account?.address]);

  function parseCollectionData() {
    const parsedCollections = [];
    for (let i = 0; i < collections.length; i++) {
      const col = collections[i];

      parsedCollections.push({
        key: col.collection_id,
        label: (
          <div>
            <div>{col.collection_name}</div>
            <div className="text-sm text-blue-500">ID: {col.collection_id}</div>
          </div>
        ),
        // TODO: make prettier
        value: (
          <div>
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
          </div>
        ),
      });
    }

    return parsedCollections;
  }

  return (
    <div className="flex flex-col gap-6">
      <h4 className="text-lg font-medium">Owned Collections</h4>
      <LabelValueGrid items={parseCollectionData() as any} />
    </div>
  );
}
