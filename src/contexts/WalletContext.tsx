import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { ethers } from 'ethers';

interface WalletContextType {
  account: string | null;
  isConnected: boolean;
  balance: string;
  provider: any;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnecting: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState('0.0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<any>(null);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsConnecting(true);
        
        // Request account access
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          
          // Set up ethers provider
          const ethersProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(ethersProvider);
          
          // Get balance (simulate)
          setBalance('12.5');
          
          toast({
            title: "Wallet Connected",
            description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
          });
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        toast({
          title: "Connection Failed",
          description: "Failed to connect to MetaMask wallet",
          variant: "destructive",
        });
      } finally {
        setIsConnecting(false);
      }
    } else {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to connect your wallet",
        variant: "destructive",
      });
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setBalance('0.0');
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  // Check if already connected on page load
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });
          
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            setBalance('12.5');
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  const value = {
    account,
    isConnected,
    balance,
    provider,
    connectWallet,
    disconnectWallet,
    isConnecting,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Extend window object for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}