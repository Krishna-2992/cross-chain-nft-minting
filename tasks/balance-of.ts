import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { getProviderUrl } from "./utils";
import { ethers } from "ethers";
import { MyNFT, MyNFT__factory } from "../typechain-types";

task('balance-of', 'Gets the balance of MyNFTs for provided address')
    .addParam(`myNft`, `The address of the MyNFT smart contract`)
    .addParam(`blockchain`, `The blockchain where the MyNFT smart contract was deployed`)
    .addParam(`owner`, `The address to check the balance of MyNFTs`)
    .setAction(async (taskArguments: TaskArguments) => {
        const rpcProviderUrl = getProviderUrl(taskArguments.blockchain);
        const provider = new ethers.JsonRpcProvider(rpcProviderUrl);

        const myNft: MyNFT = MyNFT__factory.connect(taskArguments.myNft, provider);

        console.log(`Attempting to check the balance of MyNFTs (${taskArguments.myNft}) for the ${taskArguments.owner} account`);

        const balanceOf = await myNft.balanceOf(taskArguments.owner);

        console.log(`The balance of MyNFTs of the ${taskArguments.owner} account is ${BigInt(balanceOf)}`);
    })