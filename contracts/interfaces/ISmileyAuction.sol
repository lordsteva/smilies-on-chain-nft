// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

interface ISmileyAuction {
    struct Auction {
        // ERC721 token id
        uint256 smileyId;
        //currently highest bid
        uint256 currentValue;
        uint256 startTime;
        uint256 endTime;
        // latest bidder
        address payable bidder;
        bool completed;
    }

    //allows anyone to complete current auction when endTime is reached, at the sam time the new one is creatd
    function completeAuctionAndStartNew() external;

    function bid(uint256) external payable;

    function updateExtendTime(uint256) external;

    function updateMinimumPrice(uint256) external;

    function updateMinimumBidIncrease(uint8) external;

    event AuctionCreated(
        uint256 indexed smileyId,
        uint256 startTime,
        uint256 endTime
    );

    event AuctionBid(
        uint256 indexed smileyId,
        address sender,
        uint256 value,
        bool extended
    );

    event AuctionExtended(uint256 indexed smileyId, uint256 endTime);

    event AuctionCompleted(
        uint256 indexed smileyId,
        address winner,
        uint256 amount
    );

    event AuctionExtendTimeUpdated(uint256);

    event AuctionMinimumPriceUpdated(uint256);

    event AuctionMinBidIncereaseUpdated(uint256);

    event NothingToMintToday(uint256 indexed timestamp);
}
