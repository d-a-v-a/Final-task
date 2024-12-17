import { expect } from "chai";
import { ethers } from "hardhat";
import { Ballot } from "../typechain-types";

describe("Ballot Contract", function () {
  let ballot: Ballot;
  let owner: any, voter1: any, voter2: any, voter3: any;

  beforeEach(async () => {
    [owner, voter1, voter2, voter3] = await ethers.getSigners();
    const proposalNames = ["Snickers", "Nuts", "KitKat"].map(name =>
        ethers.encodeBytes32String(name)
    );

    const ballotFactory = await ethers.getContractFactory("Ballot");
    ballot = (await ballotFactory.deploy(proposalNames)) as Ballot;

  });

  describe("Deployment", function () {
    it("Should set the right chairperson", async function () {
      expect(await ballot.chairperson()).to.equal(owner.address);
    });

    it("Should initialize proposals correctly", async function () {
      const proposal1 = await ballot.proposals(0);
      const proposal2 = await ballot.proposals(1);
      const proposal3 = await ballot.proposals(2);

      expect(proposal1.name).to.equal(ethers.encodeBytes32String("Snickers"));
      expect(proposal2.name).to.equal(ethers.encodeBytes32String("Nuts"));
      expect(proposal3.name).to.equal(ethers.encodeBytes32String("KitKat"));
    });
  });

  describe("Voting", function () {
    it("Should allow chairperson to give right to vote", async function () {
      await ballot.giveRightToVote(voter1.address);
      const voter = await ballot.voters(voter1.address);

      expect(voter.weight).to.equal(1);
      expect(voter.voted).to.equal(false);
    });

    it("Should not allow a voter to vote twice", async function () {
      await ballot.giveRightToVote(voter1.address);
      await ballot.connect(voter1).vote(0);

      const voter = await ballot.voters(voter1.address);
      expect(voter.voted).to.equal(true);

      await expect(ballot.connect(voter1).vote(1)).to.be.revertedWith("Already voted");
    });

    it("Should correctly count votes", async function () {
      await ballot.giveRightToVote(voter1.address);
      await ballot.giveRightToVote(voter2.address);

      await ballot.connect(voter1).vote(0);
      await ballot.connect(voter2).vote(1);

      const proposal1 = await ballot.proposals(0);
      const proposal2 = await ballot.proposals(1);

      expect(proposal1.voteCount).to.equal(1);
      expect(proposal2.voteCount).to.equal(1);
    });
  });

  describe("Delegation", function () {
    it("Should allow delegation of votes", async function () {
      await ballot.giveRightToVote(voter1.address);
      await ballot.giveRightToVote(voter2.address);

      await ballot.connect(voter1).delegate(voter2.address);
      const voter = await ballot.voters(voter1.address);

      expect(voter.voted).to.equal(true);
      expect(voter.delegate).to.equal(voter2.address);
    });

    it("Should transfer vote weight on delegation", async function () {
      await ballot.giveRightToVote(voter1.address);
      await ballot.giveRightToVote(voter2.address);

      await ballot.connect(voter1).delegate(voter2.address);
      const delegate = await ballot.voters(voter2.address);

      expect(delegate.weight).to.equal(2);
    });

    it("Should prevent delegation loops", async function () {
      await ballot.giveRightToVote(voter1.address);
      await ballot.giveRightToVote(voter2.address);
      await ballot.giveRightToVote(voter3.address);

      await ballot.connect(voter1).delegate(voter2.address);

      await expect(ballot.connect(voter2).delegate(voter1.address)).to.be.revertedWith("Found loop in delegation");
    });
  });

  describe("Winning Proposal", function () {
    it("Should determine the winning proposal correctly", async function () {
      await ballot.giveRightToVote(voter1.address);
      await ballot.giveRightToVote(voter2.address);
      await ballot.giveRightToVote(voter3.address);

      await ballot.connect(voter1).vote(0);
      await ballot.connect(voter2).vote(0);
      await ballot.connect(voter3).vote(1);

      const winningProposal = await ballot.winningProposal();
      expect(winningProposal).to.equal(0);

      const winnerName = await ballot.winnerName();
      expect(winnerName).to.equal(ethers.encodeBytes32String("Snickers"));
    });
  });

  describe("End Voting", function () {
    it("Should prevent further actions after voting ends", async function () {
      await ballot.giveRightToVote(voter1.address);
      await ballot.endVoting();

      await expect(ballot.giveRightToVote(voter2.address)).to.be.revertedWith("Voting has ended");
      await expect(ballot.connect(voter1).vote(0)).to.be.revertedWith("Voting has ended");
    });
  });
});
