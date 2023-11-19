import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment, TaskArguments } from 'hardhat/types'
import { getPrivateKey, getProviderUrl, getRouterConfig } from './utils'
import { Wallet, ethers } from 'ethers'
import { SourceMinter, SourceMinter__factory } from '../typechain-types'
import { LINK_ADDRESSES } from './constants'

task(`deploy-source-minter`, `Deploys SourceMinter.sol smart contract`)
    .addOptionalParam(
        `router`,
        `The address of the Router contract on the source blockchain`
    )
    .setAction(
        async (
            taskArguments: TaskArguments,
            hre: HardhatRuntimeEnvironment
        ) => {
            const routerAddress = taskArguments.router
                ? taskArguments.router
                : getRouterConfig(hre.network.name).address
            const linkAddress = taskArguments.link
                ? taskArguments.link
                : LINK_ADDRESSES[hre.network.name]

            const privateKey = getPrivateKey()
            const rpcProviderUrl = getProviderUrl(hre.network.name)

            const provider = new ethers.JsonRpcProvider(rpcProviderUrl)
            const wallet = new Wallet(privateKey)
            const deployer = wallet.connect(provider)


            console.log(
                `Attempting to deploy SourceMinter smart contract on the ${hre.network.name} blockchain using ${deployer.address} address, with the Router address ${routerAddress} and LINK address ${linkAddress} provided as constructor arguments`
            )
            const sourceMinter: SourceMinter = await hre.ethers.deployContract(
                'SourceMinter',
                [routerAddress, linkAddress]
            )
            await sourceMinter.waitForDeployment()

            console.log(
                `✅ SourceMinter contract deployed at address ${sourceMinter.target} on the ${hre.network.name} blockchain`
            )
        }
    )
