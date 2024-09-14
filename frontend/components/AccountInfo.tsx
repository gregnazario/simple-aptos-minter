import { useWallet } from "@aptos-labs/wallet-adapter-react";
// Internal components
import { LabelValueGrid, DisplayValue } from "@/components/LabelValueGrid";

export function AccountInfo() {
  const { account } = useWallet();
  return (
    <div className="flex flex-col gap-6">
      <h4 className="text-lg font-medium">Account Info</h4>
      <LabelValueGrid
        items={[
          {
            label: "Address",
            value: <DisplayValue value={account?.address ?? "Not Present"} isCorrect={!!account?.address} />,
          },
        ]}
      />
    </div>
  );
}
