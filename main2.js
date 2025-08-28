import { ethers } from "ethers";

let provider;
let signer;

const connectBtn = document.getElementById("connectBtn");
const walletAddress = document.getElementById("walletAddress");
const balanceEl = document.getElementById("balance");
const sendBtn = document.getElementById("sendBtn");

// 🔹 Function to load wallet info
async function loadWallet() {
  if (!window.ethereum) {
    walletAddress.textContent = "MetaMask not installed ❌";
    return;
  }

  provider = new ethers.BrowserProvider(window.ethereum);

  try {
    const accounts = await provider.listAccounts();

    if (accounts.length > 0) {
      // Already connected
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

// 🔹 Click handler for manual connection
connectBtn.addEventListener("click", async () => {
  if (!window.ethereum) return alert("Please install MetaMask!");

  provider = new ethers.BrowserProvider(window.ethereum);

  try {
    await provider.send("eth_requestAccounts", []);
    await loadWallet();
  } catch (err) {
    console.error("User rejected connection", err);
  }
});

// 🔹 Handle account changes (user switches in MetaMask)
if (window.ethereum) {
  window.ethereum.on("accountsChanged", loadWallet);
  window.ethereum.on("chainChanged", () => window.location.reload());
}

// 🔹 Run on page load
loadWallet();

// 🔹 Send ETH function
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
