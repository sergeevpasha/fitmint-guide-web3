import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const deployFTG: DeployFunction = async function ({ getNamedAccounts, deployments }: HardhatRuntimeEnvironment) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    log('---------------------------------------------------');
    log('Deploying FTG Token and waiting for confirmations...');

    const ftg = await deploy('FitmintGuideToken', {
        from: deployer,
        log: true,
        proxy: {
            owner: deployer,
            execute: {
                init: {
                    methodName: 'initialize',
                    args: ['Fitmint Guide Token', 'FGT', 100]
                }
            },
            proxyContract: 'OpenZeppelinTransparentProxy'
        }
    });

    log('FTG deployed to:', ftg.address);
};

export default deployFTG;
deployFTG.tags = ['ALL', 'FTG'];
