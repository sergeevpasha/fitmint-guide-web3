import { expect } from 'chai';
import { FitmintGuideActivities, FitmintGuideToken } from '../../typechain';
import { deployments, ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, utils } from 'ethers';

const toEth = (number: number): BigNumber => utils.parseEther(number.toString());

describe('Fitmint Guide Activities', function () {
    this.timeout(10000);

    let ftg: FitmintGuideToken;
    let ftga: FitmintGuideActivities;
    let owner: SignerWithAddress;
    let user: SignerWithAddress;

    beforeEach(async () => {
        await deployments.fixture(['ALL']);
        [owner, user] = await ethers.getSigners();
        ftg = await ethers.getContract('FitmintGuideToken');
        ftga = await ethers.getContract('FitmintGuideActivities');
    });

    describe('Activities', () => {
        const activityBase64 = btoa(
            JSON.stringify({
                earnings: 1,
                calories: 88.5
            })
        );

        it('Posts activity results', async () => {
            await expect(await ftga.postResults(activityBase64))
                .to.emit(ftga, 'ActivityUploaded')
                .withArgs(owner.address, activityBase64);
        });

        it('Get User Attempts count', async () => {
            await expect(await ftga.getUserAttempts(owner.address)).to.be.equal(10);
            await ftga.postResults(activityBase64);
            await expect(await ftga.getUserAttempts(owner.address)).to.be.equal(9);
        });

        it('Top Up account balance', async () => {
            await ftg.approve(ftga.address, toEth(10));
            await expect(await ftga.topUp(toEth(10)))
                .to.emit(ftga, 'AccountTopUp')
                .withArgs(owner.address, 10);
        });

        it("Can't Top Up account balance without allowance", async () => {
            await ftg.mint(user.address, toEth(10));
            await expect(ftga.connect(user).topUp(toEth(10))).to.be.revertedWith('ERC20: insufficient allowance');
        });

        it("Can't Top Up account balance without FGT", async () => {
            await ftg.connect(user).approve(ftga.address, toEth(10));
            await expect(ftga.connect(user).topUp(toEth(10))).to.be.revertedWith('Insufficient FTG balance');
        });

        it('Buy tokens for MATIC', async () => {
            await expect(
                await ftga.buyTokens({
                    value: toEth(10)
                })
            )
                .to.emit(ftga, 'TokenSold')
                .withArgs(owner.address, toEth(20));
        });

        it('Can withdraw MATIC for owner', async () => {
            await ftga.buyTokens({ value: toEth(10) });
            await ftga.withdraw();
            await expect(await ftg.balanceOf(owner.address)).to.be.equal(toEth(120));
        });

        it("Can't withdraw MATIC for owner", async () => {
            await ftga.connect(user).buyTokens({ value: toEth(10) });
            await expect(ftga.connect(user).withdraw()).to.be.revertedWith('Ownable: caller is not the owner');
        });

        context('Having a user that already posted 10 results', () => {
            beforeEach(async () => {
                for (let i = 0; i < 10; i++) {
                    await ftga.postResults(activityBase64);
                }
            });

            it('Fails to post 11th activity result', async () => {
                await expect(ftga.postResults(activityBase64)).to.be.revertedWith('You reached the limit');
            });
        });
    });
});
