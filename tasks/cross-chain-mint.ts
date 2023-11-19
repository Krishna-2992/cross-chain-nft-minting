import { task } from 'hardhat/config'
import { TaskArguments } from 'hardhat/types'
import { getProviderUrl, getPrivateKey, getPayFeesIn, getRouterConfig } from './utils'
import { Wallet, ethers } from 'ethers'
import { SourceMinter, SourceMinter__factory } from '../typechain-types'
import { LINK_ADDRESSES, PayFeesIn } from './constants'

task('cross-chain-mint', 'Mints a new NFT by sending the cross-chain message')
    .addParam(
        `sourceBlockchain`,
        `The name of the source blockchain (for example ethereumSepolia)`
    )
    .addParam(
        `sourceMinter`,
        `The address of the SourceMinter.sol smart contract on the source blockchain`
    )
    .addParam(
        `destinationBlockchain`,
        `The name of the destination blockchain (for example polygonMumbai)`
    )
    .addParam(
        `destinationMinter`,
        `The address of the DestinationMinter.sol smart contract on the destination blockchain`
    )
    .addParam(`payFeesIn`, `Choose between 'Native' nd a'LINK'`)
    .setAction(async (taskArguments: TaskArguments) => {

        const {sourceBlockchain, sourceMinter, destinationBlockchain, destinationMinter, payFeesIn} = taskArguments

        const rpcProviderUrl = getProviderUrl(sourceBlockchain)
        const privateKey = getPrivateKey()

        const provider = new ethers.JsonRpcProvider(rpcProviderUrl)
        const wallet = new Wallet(privateKey)
        const signer = wallet.connect(provider)

        const sourceMinterContract: SourceMinter = SourceMinter__factory.connect(sourceMinter, signer)

        const destinationChainSelector = getRouterConfig(destinationBlockchain).chainSelector
        const fee = getPayFeesIn(payFeesIn)

        console.log(`Attempting to call the mint function of the SourceMinter.sol smart contract on the ${sourceBlockchain} from ${signer.address} account`);

        const tx = await sourceMinterContract.mint(
            destinationChainSelector, 
            destinationMinter, 
            fee        
        )
        const receipt = await tx.wait()

        console.log(`✅ Mint request sent, transaction hash: ${tx.hash}`);

        console.log(`✅ Task cross-chain-mint finished with the execution`);
    })
