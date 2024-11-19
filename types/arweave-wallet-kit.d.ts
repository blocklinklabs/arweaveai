declare module "arweave-wallet-kit" {
  export interface WalletKitConfig {
    permissions: string[];
    ensurePermissions: boolean;
  }

  export const ArweaveWalletKit: React.FC<{
    config: WalletKitConfig;
    children: React.ReactNode;
  }>;

  export const ConnectButton: React.FC;
}
