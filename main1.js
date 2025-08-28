import { ethers } from "ethers";

let provider;
let signer;

const connectBtn = document.getElementById("connectBtn");
const walletAddress = document.getElementById("walletAddress");
const balanceEl = document.getElementById("balance");
const sendBtn = document.getElementById("sendBtn");

connectBtn.addEventListener("click", async () => {
  if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    
    const address = await signer.getAddress();
    walletAddress.textContent = `Connected: ${address}`;

    const balance = await provider.getBalance(address);
    balanceEl.textContent = `Balance: ${ethers.formatEther(balance)} ETH`;
  } else {
    alert("Please install MetaMask!");
  }
});

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
  console.log("Connect button:", connectBtn);
});
