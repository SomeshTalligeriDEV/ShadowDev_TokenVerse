import { useState, useEffect } from "react";
import { ethers } from "ethers";

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  // Check if MetaMask is already connected
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      (window as any).ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
        if (accounts.length > 0) setAccount(accounts[0]);
      });

      // Listen for account changes
      (window as any).ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      });
    }
  }, []);

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      alert("MetaMask not detected! Please install it: https://metamask.io/");
      return;
    }

    try {
      setIsConnecting(true);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Wallet connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    account,
    isConnected: !!account,
    isConnecting,
    connectWallet,
  };
}
