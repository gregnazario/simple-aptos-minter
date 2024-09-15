import { useWallet } from "@aptos-labs/wallet-adapter-react";
// Internal Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Collections } from "@/components/Collections.tsx";
import { NetworkInfo } from "@/components/NetworkInfo";
import { AccountInfo } from "@/components/AccountInfo.tsx";
import { CreateCollection } from "@/components/CreateCollection.tsx";
import { ModifyCollection } from "@/components/ModifyCollection.tsx";
import { useState } from "react";
import Select from "react-select";
import { Network } from "@aptos-labs/ts-sdk";
import { WrongNetworkAlert } from "@/components/WrongNetworkAlert.tsx";

function App() {
  const { connected } = useWallet();
  const options = Object.values(Network).map((network) => ({ value: network, label: network }));

  const [network, setNetwork] = useState<Network>(options[0].value);

  return (
    <>
      <Header />

      <WrongNetworkAlert expectedNetwork={network} />

      <div className="flex items-center justify-center flex-col">
        <Select
          defaultValue={options[0]}
          options={options}
          onChange={(e) => {
            setNetwork(e?.value ?? network);
          }}
        />
        {connected ? (
          <Card>
            <CardContent className="flex flex-col gap-10 pt-6">
              <NetworkInfo />
              <AccountInfo />
              <Collections expectedNetwork={network} />
              <CreateCollection expectedNetwork={network} />
              <ModifyCollection expectedNetwork={network} />
            </CardContent>
          </Card>
        ) : (
          <CardHeader>
            <CardTitle>To get started Connect a wallet</CardTitle>
          </CardHeader>
        )}
      </div>
    </>
  );
}

export default App;
