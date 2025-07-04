# Data Sentinel: Full Setup & Usage Guide

## Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [1. Clone the Repository](#1-clone-the-repository)
- [2. Blockchain Setup (Hardhat)](#2-blockchain-setup-hardhat)
- [3. Backend Setup (Flask)](#3-backend-setup-flask)
- [4. Frontend Setup (React)](#4-frontend-setup-react)
- [5. MetaMask Setup](#5-metamask-setup)
- [6. Using the App](#6-using-the-app)
- [7. Troubleshooting](#7-troubleshooting)
- [8. Useful Scripts & Commands](#8-useful-scripts--commands)

---

## Project Overview
Data Sentinel is a privacy and data protection platform with blockchain-based honeytoken registration, user consent management, policy enforcement, and risk monitoring. It features a modern React frontend, Flask backend, and a Hardhat-based local blockchain for tamper-proof tracking.

---

## Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS, ethers.js, jsPDF
- **Backend:** Python, Flask, Flask-CORS, Faker
- **Blockchain:** Solidity, Hardhat, ethers.js
- **Other:** MetaMask (browser extension)

---

## Prerequisites
- **Node.js** (v18+ recommended)
- **npm** (comes with Node.js)
- **Python** (3.8+)
- **pip** (comes with Python)
- **MetaMask** browser extension ([Download here](https://metamask.io/download/))

---

## 1. Clone the Repository
```bash
# In your desired directory:
git clone <REPO_URL>
cd Data-Sentinal-Canara-Hack
```

---

## 2. Blockchain Setup (Hardhat)
This project uses a local Ethereum blockchain for honeytoken registration.

### Install dependencies:
```bash
cd ../blockchain
npm install
```

### Start the local Hardhat node:
```bash
npx hardhat node
```
- This will start a blockchain at `http://127.0.0.1:8545` (chainId: 31337).
- **Leave this terminal running.**

### Deploy the contract:
Open a new terminal in the `blockchain` directory:
```bash
npx hardhat run scripts/deploy.js --network localhost
```
- Note the deployed contract address (e.g., `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`).
- If you redeploy, update the address in the frontend.

---

## 3. Backend Setup (Flask)
```bash
cd ../Data-Sentinal-Canara-Hack
python -m venv venv
# Activate the virtual environment:
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python aap.py
```
- The backend will run at `http://localhost:5000`.

---

## 4. Frontend Setup (React)
```bash
cd Data-Sentinal-Canara-Hack
npm install
npm install ethers jspdf
npm run dev
```
- The frontend will run at `http://localhost:5173`.

### Update the Contract Address
- Open `src/pages/AdminDashboard.tsx`.
- Set `const HONEYTOKEN_CONTRACT_ADDRESS = '<your deployed address>';`
- Save and restart the frontend if you redeploy the contract.

---

## 5. MetaMask Setup
1. **Install MetaMask** ([Download](https://metamask.io/download/))
2. **Add a Local Network:**
   - Open MetaMask > Networks > Add Network (or Custom RPC)
   - **Network Name:** Localhost 8545
   - **RPC URL:** http://127.0.0.1:8545
   - **Chain ID:** 31337
   - **Currency Symbol:** ETH
   - **Block Explorer URL:** (leave blank)
   - Save
3. **Import an Account:**
   - Use one of the private keys from the Hardhat node output (e.g., Account #0).
   - Go to MetaMask > Import Account > Paste the private key.
   - This gives you 10,000 ETH for testing.
4. **Switch to the Localhost 8545 network in MetaMask.**

---

## 6. Using the App
- Open `http://localhost:5173` in your browser.
- Use the Admin Dashboard to register and verify honeytokens on the blockchain.
- After registration, you can download a PDF receipt with transaction details.
- To inspect transactions:
  - Copy the transaction hash from the UI.
  - Open a terminal and run:
    ```bash
    npx hardhat console --network localhost
    ```
    Then in the console:
    ```js
    await ethers.provider.getTransaction('<txHash>')
    await ethers.provider.getTransactionReceipt('<txHash>')
    ```
  - Or check MetaMask activity.

---

## 7. Troubleshooting
- **ENS Error:**
  - Make sure you use a valid hex contract address, not an ENS name or placeholder.
  - Update the contract address in the frontend after every redeploy.
- **MetaMask Not Connecting:**
  - Ensure MetaMask is on the `Localhost 8545` network (chainId 31337).
  - Restart MetaMask if needed.
- **Contract Not Found:**
  - Make sure the Hardhat node is running and the contract is deployed.
- **Frontend/Backend Not Starting:**
  - Ensure all dependencies are installed (`npm install`, `pip install -r requirements.txt`).
  - Use the correct Python virtual environment.
- **PDF Download Not Working:**
  - Run `npm install jspdf` in the frontend directory.

---

## 8. Useful Scripts & Commands
- **Start Hardhat node:**
  ```bash
  cd blockchain
  npx hardhat node
  ```
- **Deploy contract:**
  ```bash
  npx hardhat run scripts/deploy.js --network localhost
  ```
- **Start backend:**
  ```bash
  cd Data-Sentinal-Canara-Hack
  python aap.py
  ```
- **Start frontend:**
  ```bash
  cd Data-Sentinal-Canara-Hack
  npm run dev
  ```
- **Hardhat console:**
  ```bash
  npx hardhat console --network localhost
  ```

---

## Need Help?
If you get stuck, check the troubleshooting section above or open an issue.

---

**Enjoy using Data Sentinel!**
