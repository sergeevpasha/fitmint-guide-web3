import { expect } from 'chai';
import { FitmintGuideToken } from '../../typechain';
import { deployments, ethers } from 'hardhat';
import { MockProvider } from 'ethereum-waffle';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, utils } from 'ethers';

const toEth = (number: number): BigNumber => utils.parseEther(number.toString());

describe('Fitmint Guide Token', function () {
    this.timeout(20000);
    const provider = new MockProvider();
    const [wallet, walletTo] = provider.getWallets();
    const initialTokenSupply: BigNumber = toEth(100);
    const initialSnapshotId: BigNumber = BigNumber.from(1);

    let ftg: FitmintGuideToken;
    let owner: SignerWithAddress;
    let user: SignerWithAddress;

    beforeEach(async () => {
        await deployments.fixture(['FTG']);
        [owner, user] = await ethers.getSigners();
        ftg = await ethers.getContract('FitmintGuideToken');
    });

    it('Has 18 decimals', async () => {
        await expect(await ftg.decimals()).to.equal(18);
    });

    it('Assigns initial balance', async () => {
        await expect(await ftg.balanceOf(wallet.address)).to.equal(0);
    });

    it('Mints to MINTER_ROLE', async () => {
        await expect(ftg.mint(wallet.address, toEth(100))).to.emit(ftg, 'Transfer');
        await expect(await ftg.balanceOf(wallet.address)).to.equal(toEth(100));
    });

    it('Fails to mint if not MINTER_ROLE', async () => {
        await expect(ftg.connect(user).mint(walletTo.address, 100)).to.be.revertedWith(
            `AccessControl: account ${user.address.toLowerCase()} is missing role ${await ftg.MINTER_ROLE()}`
        );
        await expect(await ftg.balanceOf(walletTo.address)).to.equal(0);
    });

    it('It Burns token', async () => {
        await ftg.mint(owner.address, toEth(100));
        await ftg.burn(toEth(10));
        await expect(await ftg.balanceOf(owner.address)).to.equal(initialTokenSupply.add(toEth(90)));
    });

    it('Emits a snapshot event', async function () {
        const snapshotTx = await ftg.snapshot();
        await expect(snapshotTx).to.emit(ftg, 'Snapshot');
    });

    it('Creates a snapshot', async () => {
        await ftg.mint(owner.address, toEth(100));
        await ftg.burn(toEth(10));
        const snapshotTx = await ftg.snapshot();
        await snapshotTx.wait(1);
        await ftg.mint(owner.address, toEth(100));
        await expect(await ftg.balanceOfAt(owner.address, initialSnapshotId)).to.equal(
            initialTokenSupply.add(toEth(90))
        );
    });

    describe('Pause', () => {
        it('Allows to transfer when unpaused', async () => {
            await ftg.transfer(walletTo.address, initialTokenSupply);

            expect(await ftg.balanceOf(owner.address)).to.be.equal(0);
            expect(await ftg.balanceOf(walletTo.address)).to.be.equal(initialTokenSupply);
        });

        it('Allows to transfer when paused and then unpaused', async () => {
            await ftg.pause();
            await ftg.unpause();
            await ftg.transfer(walletTo.address, initialTokenSupply);

            expect(await ftg.balanceOf(owner.address)).to.be.equal(0);
            expect(await ftg.balanceOf(walletTo.address)).to.be.equal(initialTokenSupply);
        });

        it('Reverts when trying to transfer when paused', async () => {
            await ftg.pause();
            await expect(ftg.transfer(walletTo.address, initialTokenSupply)).to.be.revertedWith('Pausable: paused');
        });
    });
});
