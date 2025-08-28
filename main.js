import { ethers } from "ethers";

let provider;
let signer;

const connectBtn = document.getElementById("connectBtn");
const walletAddress = document.getElementById("walletAddress");
const balanceEl = document.getElementById("balance");
const sendBtn = document.getElementById("sendBtn");

// 🔹 Sepolia chain info
const SEPOLIA_CHAIN_ID = "0xaa36a7"; // Hex for 11155111
const SEPOLIA_PARAMS = {
  chainId: SEPOLIA_CHAIN_ID,
  chainName: "Sepolia Test Network",
  nativeCurrency: {
    name: "Sepolia ETH",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: ["https://rpc.sepolia.org"],
  blockExplorerUrls: ["https://sepolia.etherscan.io/"]
};

// 🔹 Ensure Sepolia is selected
async function switchToSepolia() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID }]
    });
  } catch (switchError) {
    // If not added, request adding the chain
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [SEPOLIA_PARAMS]
      });
    } else {
      console.error("Failed to switch network", switchError);
    }
  }
}

// 🔹 Load wallet info
async function loadWallet() {
  if (!window.ethereum) {
    walletAddress.textContent = "MetaMask not installed ❌";
    return;
  }

  provider = new ethers.BrowserProvider(window.ethereum);

  try {
    const accounts = await provider.listAccounts();
    if (accounts.length > 0) {
      await switchToSepolia(); // ✅ ensure Sepolia

      signer = await provider.getSigner();
      const address = await signer.getAddress();
      walletAddress.textContent = `Connected: ${address}`;

      const balance = await provider.getBalance(address);
      balanceEl.textContent = `Balance: ${ethers.formatEther(balance)} ETH`;
    } else {
      walletAddress.textContent = "Not connected";
    }
  } catch (err) {
    console.error("Error checking accounts", err);
  }
}

// 🔹 Manual connect
connectBtn.addEventListener("click", async () => {
  if (!window.ethereum) return alert("Please install MetaMask!");

  provider = new ethers.BrowserProvider(window.ethereum);

  try {
    await provider.send("eth_requestAccounts", []);
    await switchToSepolia(); // ✅ force Sepolia
    await loadWallet();
  } catch (err) {
    console.error("User rejected connection", err);
  }
});

// 🔹 Handle account/network changes
if (window.ethereum) {
  window.ethereum.on("accountsChanged", loadWallet);
  window.ethereum.on("chainChanged", () => window.location.reload());
}

// 🔹 Run on page load
loadWallet();

// 🔹 Send ETH
sendBtn.addEventListener("click", async () => {
  if (!signer) return alert("Connect wallet first!");

  const to = document.getElementById("toAddress").value;
  const amount = document.getElementById("amount").value;

  try {
    const tx = await signer.sendTransaction({
      to,
      value: ethers.parseEther(amount)
    });
    alert(`Transaction sent! Hash: ${tx.hash}`);
  } catch (err) {
    alert("Error: " + err.message);
  }
});
