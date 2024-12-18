import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys a contract named "Ballot" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployBallot: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const proposalNames = ["Snickers", "Nuts", "KitKat"].map(name => hre.ethers.encodeBytes32String(name));

  await deploy("Ballot", {
    from: deployer,
    args: [proposalNames],
    log: true,
    autoMine: true,
  });

  console.log("Ballot contract deployed!");
};

export default deployBallot;

deployBallot.tags = ["Ballot"];
