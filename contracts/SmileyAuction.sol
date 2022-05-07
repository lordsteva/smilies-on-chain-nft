// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/ISmileyNFT.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ISmileyAuction} from "./interfaces/ISmileyAuction.sol";
import {ISmileyVotingToken} from "./interfaces/ISmileyVotingToken.sol";

import {IWETH} from "./interfaces/IWETH.sol";

contract SmileyAuction is ISmileyAuction, ReentrancyGuard, Ownable {
    ISmileyNFT public smileyNFT;
    ISmileyVotingToken public smileyVotingToken;
    address public timelockAddress;

    uint256 public extendTime;
    uint256 public minimumPrice;
    uint256 public auctionDuration;
    ISmileyAuction.Auction public auction;
    uint8 public minimumBidIncrease;

    constructor(
        ISmileyNFT _smileyNFT,
        ISmileyVotingToken _smileyVotingToken,
        address _timelockAddress,
        uint256 _extendTime,
        uint256 _minimumPrice,
        uint8 _minimumBidIncrease,
        uint256 _auctionDuration
    ) {
        smileyNFT = _smileyNFT;
        extendTime = _extendTime;
        minimumPrice = _minimumPrice;
        minimumBidIncrease = _minimumBidIncrease;
        auctionDuration = _auctionDuration;
        smileyVotingToken = _smileyVotingToken;
        timelockAddress = _timelockAddress;
    }

    function completeAuctionAndStartNew() external override nonReentrant {
        _completeAuction();
        _createAuction();
        smileyVotingToken.mint(msg.sender, 3);
    }

    function startProject() external onlyOwner {
        require(auction.smileyId == 0, "Project already started");
        _createAuction();
    }

    function bid(uint256 smileyId) external payable override nonReentrant {
        require(block.timestamp < auction.endTime, "Auction expired");
        require(auction.smileyId == smileyId, "Wrong Smiley ID");
        require(msg.value >= minimumPrice, "Value is too small");
        require(
            msg.value >=
                auction.currentValue +
                    ((auction.currentValue * minimumBidIncrease) / 100),
            "Bid increment too small"
        );

        address payable lastBidder = auction.bidder;

        if (lastBidder != address(0)) {
            safeTransferETH(lastBidder, auction.currentValue);
        }

        auction.currentValue = msg.value;
        auction.bidder = payable(msg.sender);

        bool shouldExtend = auction.endTime - block.timestamp < extendTime;
        if (shouldExtend) {
            auction.endTime = block.timestamp + extendTime;
        }

        emit AuctionBid(auction.smileyId, msg.sender, msg.value, shouldExtend);

        if (shouldExtend) {
            emit AuctionExtended(auction.smileyId, auction.endTime);
        }
    }

    function updateExtendTime(uint256 _extend) external override onlyOwner {
        extendTime = _extend;
        emit AuctionExtendTimeUpdated(_extend);
    }

    function updateMinimumPrice(uint256 _minPrice) external override onlyOwner {
        minimumPrice = _minPrice;
        emit AuctionMinimumPriceUpdated(_minPrice);
    }

    function updateMinimumBidIncrease(uint8 _minimumBidIncrease)
        external
        override
        onlyOwner
    {
        minimumBidIncrease = _minimumBidIncrease;
        emit AuctionMinBidIncereaseUpdated(_minimumBidIncrease);
    }

    function _createAuction() internal {
        uint256 smileyId = smileyNFT.mint();
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + auctionDuration;
        auction = Auction({
            smileyId: smileyId,
            currentValue: 0,
            startTime: startTime,
            endTime: endTime,
            bidder: payable(0),
            completed: false
        });

        emit AuctionCreated(smileyId, startTime, endTime);
    }

    function _completeAuction() internal {
        require(auction.startTime != 0, "Auction hasn't begun");
        require(!auction.completed, "Auction already completed");
        require(block.timestamp >= auction.endTime, "Auction hasn't completed");

        auction.completed = true;

        if (auction.bidder == address(0)) {
            smileyNFT.transferFrom(
                address(this),
                timelockAddress,
                auction.smileyId
            );
        } else {
            smileyNFT.transferFrom(
                address(this),
                auction.bidder,
                auction.smileyId
            );
            uint256 points = smileyNFT.getPoints(auction.smileyId);
            smileyVotingToken.mint(auction.bidder, points);
            safeTransferETH(timelockAddress, auction.currentValue);
        }

        emit AuctionCompleted(
            auction.smileyId,
            auction.bidder,
            auction.currentValue
        );
    }

    function safeTransferETH(address to, uint256 value) internal {
        (bool success, ) = to.call{value: value, gas: 30000}(new bytes(0));
    }
}
