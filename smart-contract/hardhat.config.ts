import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();

const {
    ETHERSCAN_KEY,
    SEPOLIA_RPC_URL,
    SEPOLIA_PRIVATE_KEY,
    MONAD_PRIVATE_KEY,
} = process.env;

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL || "",
            accounts: SEPOLIA_PRIVATE_KEY ? [SEPOLIA_PRIVATE_KEY] : [],
        },
        monadTestnet: {
            url: "https://testnet-rpc.monad.xyz",
            chainId: 10143,
            accounts: MONAD_PRIVATE_KEY ? [`${MONAD_PRIVATE_KEY}`] : [],
        },
        monadMainnet: {
            url: "https://rpc.monad.xyz",
            chainId: 143,
            accounts: MONAD_PRIVATE_KEY ? [`${MONAD_PRIVATE_KEY}`] : [],
        },
    },
    gasReporter: {
        enabled: true,
    },
    etherscan: {
        apiKey: `${ETHERSCAN_KEY}`,
    },
};

export default config;
