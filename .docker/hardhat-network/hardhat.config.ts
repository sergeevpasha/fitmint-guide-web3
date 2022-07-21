import { HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import 'hardhat-deploy';

const config: HardhatUserConfig = {
    solidity: '0.8.14',
    defaultNetwork: 'hardhat',
    networks: {
        hardhat: {
            gasPrice: 225000000000,
            chainId: 1337,
            mining: {
                auto: false,
                interval: 1000
            }
        }
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0
        }
    }
};

export default config;
