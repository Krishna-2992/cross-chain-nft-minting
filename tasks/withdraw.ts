import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { getPrivateKey, getProviderUrl } from "./utils";
import { Wallet, ethers } from "ethers";
import { Withdraw, Withdraw__factory } from "../typechain-types";

task(`withdraw`, `Withdraws tokens and coins from Withdraw.sol. Must be called by an Owner, otherwise it will revert`)
    .addParam(`blockchain`, `The name of the blockchain (for example ethereumSepolia)`)
    .addParam(`from`, `The address of the Withdraw.sol smart contract from which funds should be withdrawn`)
    .addParam(`beneficiary`, `The address to withdraw to`)
    .addOptionalParam(`tokenAddress`, `The address of a token to withdraw`)
    .setAction(async (taskArguments: TaskArguments) => {
        const { blockchain, from, beneficiary, tokenAddress } = taskArguments;

        const privateKey = getPrivateKey();
        const rpcProviderUrl = getProviderUrl(blockchain);

        const provider = new ethers.JsonRpcProvider(rpcProviderUrl);
        const wallet = new Wallet(privateKey);
        const signer = wallet.connect(provider);

        const withdraw: Withdraw = Withdraw__factory.connect(from, signer);


        if (tokenAddress) {
            console.log(`Attempting to withdraw ${tokenAddress} tokens from ${from} to ${beneficiary}`);

            const withdrawalTx = await withdraw.withdrawToken(beneficiary, tokenAddress);
            await withdrawalTx.wait();

            console.log(`✅ Withdrawal successful, transaction hash: ${withdrawalTx.hash}`);
        } else {
            console.log(`Attempting to withdraw coins from ${from} to ${beneficiary}`);

            const withdrawalTx = await withdraw.withdraw(beneficiary);
            await withdrawalTx.wait();

            console.log(`✅ Withdrawal successful, transaction hash: ${withdrawalTx.hash}`);
        }
    })