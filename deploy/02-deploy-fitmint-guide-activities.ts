import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ethers } from 'hardhat';

const deployFTGA: DeployFunction = async function ({ getNamedAccounts, deployments }: HardhatRuntimeEnvironment) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const ftg = await ethers.getContract('FitmintGuideToken', deployer);

    log('---------------------------------------------------');
    log('Deploying Fitmint Guide Activities Contract and waiting for confirmations...');

    const activities = await deploy('FitmintGuideActivities', {
        from: deployer,
        log: true,
        proxy: {
            owner: deployer,
            execute: {
                init: {
                    methodName: 'initialize',
                    args: [ftg.address]
                }
            },
            proxyContract: 'OpenZeppelinTransparentProxy'
        }
    });

    await ftg.grantRole(await ftg.MINTER_ROLE(), activities.address);

    log('Fitmint Guide Activities Contract deployed to:', activities.address);
};

export default deployFTGA;
deployFTGA.tags = ['ALL', 'FTGA'];
