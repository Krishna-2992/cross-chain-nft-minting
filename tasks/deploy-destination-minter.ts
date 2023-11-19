import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment, TaskArguments } from 'hardhat/types'
import { getProviderUrl, getPrivateKey, getRouterConfig } from './utils'
import { Wallet, ethers } from 'ethers'
import { DestinationMinter, MyNFT, MyNFT__factory } from '../typechain-types'

task(
    `deploy-destination-minter`,
    `Deploys MyNFT.sol and DestinationMinter.sol smart contracts`
)
    .addOptionalParam(
        `router`,
        'The address of router contract in destination blockchain'
    )
    .setAction(
        async (
            taskArguments: TaskArguments,
            hre: HardhatRuntimeEnvironment
        ) => {
            const routerAddress = taskArguments.router
                ? taskArguments.router
                : getRouterConfig(hre.network.name).address

            const privateKey = getPrivateKey()
            const rpcProviderUrl = getProviderUrl(hre.network.name)

            const provider = new ethers.JsonRpcProvider(rpcProviderUrl)
            const wallet = new Wallet(privateKey)
            const deployer = wallet.connect(provider)

            console.log(
                `Attempting to deploy MyNFT smart contract on the ${hre.network.name} blockchain using ${deployer.address} address`
            )

            const myNft: MyNFT = await hre.ethers.deployContract('MyNFT')
            await myNft.waitForDeployment()

            console.log(
                `✅ MyNFT contract deployed at address ${myNft.target} on the ${hre.network.name} blockchain`
            )

            console.log(
                `Attempting to deploy DestinationMinter smart contract on the ${hre.network.name} blockchain using ${deployer.address} address, with the Router address ${routerAddress} provided as constructor argument`
            )

            const destinationMinter: DestinationMinter =
                await hre.ethers.deployContract('DestinationMinter', [
                    routerAddress,
                    myNft.getAddress(),
                ])
            await destinationMinter.waitForDeployment()

            console.log(
                `✅ DestinationMinter contract deployed at address ${destinationMinter.target} on the ${hre.network.name} blockchain`
            )

            console.log(
                `Attempting to grant the minter role to the DestinationMinter smart contract`
            )

            const tx = await myNft.transferOwnership(
                destinationMinter.getAddress()
            )
            await tx.wait()
            console.log(
                `✅ DestinationMinter can now mint MyNFTs. Transaction hash: ${tx.hash}`
            )
        }
    )
