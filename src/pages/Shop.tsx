import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, Coins } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { ethers } from 'ethers';
import { useToast } from "@/components/ui/use-toast";

const tokenPackages = [
  { tokens: 50, eth: 0.00013 },
  { tokens: 100, eth: 0.00026 },
  { tokens: 250, eth: 0.00065 },
  { tokens: 500, eth: 0.0013 },
  { tokens: 1000, eth: 0.0026 },
  { tokens: 5000, eth: 0.013 }
];

const COMPANY_WALLET = "0x71F7E3701D8cf8719B69d51b7AeC0409210b6617";

const Shop = () => {
  // useAuth already imported and used above; do not redeclare user
  const { toast } = useToast();
  
  const [provider, setProvider] = useState<any>(null);
  const [account, setAccount] = useState<string | null>(null);

  // Initialize provider and account
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          console.log('Configuring Ganache network...');
          
          // First try to add the Ganache network
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x539', // 1337 in hex
                chainName: 'Ganache',
                nativeCurrency: { 
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['http://127.0.0.1:7545'],
                blockExplorerUrls: []
              }]
            });
            console.log('Ganache network added successfully');
          } catch (addError) {
            console.log('Network might already exist:', addError);
          }

          // Then try to switch to the Ganache network
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x539' }] // 1337 in hex
          });
          console.log('Switched to Ganache network');

          // Create provider after ensuring correct network
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);
          
          // Get accounts
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]);
          
        } catch (err) {
          console.error('Failed to initialize:', err);
          toast({
            title: "Network Error",
            description: "Please make sure Ganache is running at 127.0.0.1:7545",
            variant: "destructive",
          });
        }
      }
    };
    
    init();
  }, []);

  const { user } = useAuth();
  const handleBuyTokens = async (tokens: number, eth: number) => {
    try {
      if (!window.ethereum) {
        toast({
          title: "MetaMask not found",
          description: "Please install MetaMask to purchase tokens",
          variant: "destructive",
        });
        return;
      }

      if (!provider || !account) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to purchase tokens",
          variant: "destructive",
        });
        return;
      }

      // Verify Ganache connection
      const network = await provider.getNetwork();
      console.log('Current network:', {
        chainId: network.chainId,
        name: network.name,
        network: network
      });

      const chainId = Number(network.chainId);
      if (chainId !== 1337) {
        toast({
          title: "Wrong Network",
          description: "Please connect to Ganache (127.0.0.1:7545)",
          variant: "destructive",
        });
        return;
      }

      const signer = await provider.getSigner();
      // Convert ETH amount to Wei
      const weiAmount = ethers.parseEther(eth.toString());
      console.log('Creating transaction...');
      // Get the current gas price from the network
      const gasPrice = await provider.getFeeData();
      console.log('Current gas price:', gasPrice);
      // Create transaction for Ganache
      const tx = {
        to: COMPANY_WALLET,
        value: weiAmount,
        from: account,
        gasLimit: 21000n, // Standard gas limit for ETH transfers
        maxFeePerGas: gasPrice.maxFeePerGas || ethers.parseUnits("20", "gwei"),
        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas || ethers.parseUnits("1", "gwei"),
      };
      console.log('Sending transaction:', tx);
      // Send transaction
      const transaction = await signer.sendTransaction(tx);
      toast({
        title: "Transaction Sent",
        description: "Please wait for confirmation...",
      });
      // Wait for transaction to be mined
      const receipt = await transaction.wait();
      toast({
        title: "Purchase Successful!",
        description: `Successfully purchased ${tokens} tokens!`,
        variant: "default",
      });
      console.log("Transaction receipt:", receipt);

      // Update tokensEarned in Supabase and force refresh in AuthContext/local state
      if (user && user.id) {
        // Update in Supabase
        const { data, error } = await supabase
          .from('users')
          .update({ tokens_earned: (user.tokensEarned || 0) + tokens })
          .eq('id', user.id)
          .select('tokens_earned')
          .single();
        // Force refresh in AuthContext/local state for live UI update
        // Ensure storage event is dispatched after updating tokens
        if (!error && data && typeof data.tokens_earned === 'number') {
          const updatedUser = { ...user, tokensEarned: data.tokens_earned };
          localStorage.setItem('auth_user', JSON.stringify(updatedUser));
          window.dispatchEvent(new Event('storage')); // Dispatch storage event
        }
      }
    } catch (error: any) {
      console.error("Transaction error:", error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to purchase tokens",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-text">
            Token Shop
          </h1>
          <p className="text-muted-foreground">
            Purchase tokens to create and manage campaigns
          </p>
        </div>

        {/* Token Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tokenPackages.map((pkg) => (
            <Card key={pkg.tokens} className="glass-card neon-glow hover:scale-[1.02] transition-transform">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    <span>{pkg.tokens.toLocaleString()} Tokens</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <p className="text-2xl font-bold text-accent">
                    {pkg.eth} ETH
                  </p>
                  <Button 
                    className="w-full bg-gradient-primary hover:opacity-90"
                    onClick={() => handleBuyTokens(pkg.tokens, pkg.eth)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Buy Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;
