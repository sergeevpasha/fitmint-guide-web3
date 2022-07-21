import { HardhatUserConfig } from 'hardhat/config';
import '@openzeppelin/hardhat-upgrades';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'dotenv/config';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import 'hardhat-deploy';

// import { BigNumber } from 'ethers';
// import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signers';

// task('accounts', 'Prints the list of accounts', async (args, hre): Promise<void> => {
//     const accounts: SignerWithAddress[] = await hre.ethers.getSigners();
//     accounts.forEach((account: SignerWithAddress): void => {
//         console.log(account.address);
//     });
// });
//
// task('balances', 'Prints the list of AVAX account balances', async (args, hre): Promise<void> => {
//     const accounts: SignerWithAddress[] = await hre.ethers.getSigners();
//     for (const account of accounts) {
//         const balance: BigNumber = await hre.ethers.provider.getBalance(account.address);
//         console.log(`${account.address} has balance ${balance.toString()}`);
//     }
// });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.14',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    defaultNetwork: 'hardhat',
    networks: {
        local: {
            url: 'http://hardhat-network:8545',
            chainId: 1337
        },
        mumbai: {
            url: process.env.MUMBAI_URL || '',
            accounts: process.env.PRIVATE_KEY_TESTNET !== undefined ? [process.env.PRIVATE_KEY_TESTNET] : [],
            gasPrice: 8750000000
        },
        polygon: {
            url: process.env.POLYGON_URL || '',
            accounts: process.env.PRIVATE_KEY_MAINNET !== undefined ? [process.env.PRIVATE_KEY_MAINNET] : []
        }
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS !== undefined,
        currency: 'USD'
    },
    etherscan: {
        apiKey: process.env.POLYGONSCAN_API_KEY
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0
        }
    },
    mocha: {
        timeout: 200000
    }
};

export default config;
