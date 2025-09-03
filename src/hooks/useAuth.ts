import { useState } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ address: string; role?: string } | null>(null);

  const login = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const address = accounts[0];

      // For now, assign role manually (replace with backend later)
      const role =
        address.toLowerCase() === "0xYourAdminWalletHere".toLowerCase()
          ? "admin"
          : "user";

      setUser({ address, role });
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return { isAuthenticated, user, login, logout };
}
