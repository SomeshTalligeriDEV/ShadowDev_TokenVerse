// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./TokenverseToken.sol";

contract Campaign is Ownable {
    // Campaign details
    string public brandName;
    string public description;
    string public ipfsImageHash;
    uint256 public rewardAmount;
    uint256 public maxParticipants;
    uint256 public currentParticipants;
    bool public isActive;
    uint256 public createdAt;
    
    // Token contract reference
    TokenverseToken public tokenContract;
    
    // Submission tracking
    struct Submission {
        string ipfsHash;
        uint256 timestamp;
        bool isVerified;
        bool isRewarded;
    }
    
    mapping(address => Submission) public submissions;
    mapping(address => bool) public hasSubmitted;
    address[] public participants;
    
    // Events
    event CampaignCreated(
        string brandName,
        string description,
        uint256 rewardAmount,
        uint256 maxParticipants
    );
    event TaskSubmitted(address indexed user, string ipfsHash);
    event SubmissionVerified(address indexed user, uint256 rewardAmount);
    event CampaignDeactivated();
    
    constructor(
        string memory _brandName,
        string memory _description,
        string memory _ipfsImageHash,
        uint256 _rewardAmount,
        uint256 _maxParticipants,
        address _tokenContract
    ) Ownable(msg.sender) {
        brandName = _brandName;
        description = _description;
        ipfsImageHash = _ipfsImageHash;
        rewardAmount = _rewardAmount;
        maxParticipants = _maxParticipants;
        tokenContract = TokenverseToken(_tokenContract);
        isActive = true;
        createdAt = block.timestamp;
        
        emit CampaignCreated(_brandName, _description, _rewardAmount, _maxParticipants);
    }
    
    /// @dev Submit a task completion proof
    function submitTask(string memory ipfsHash) external {
        require(isActive, "Campaign: not active");
        require(!hasSubmitted[msg.sender], "Campaign: already submitted");
        require(currentParticipants < maxParticipants, "Campaign: full");
        require(bytes(ipfsHash).length > 0, "Campaign: IPFS hash empty");
        
        submissions[msg.sender] = Submission({
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            isVerified: false,
            isRewarded: false
        });
        
        hasSubmitted[msg.sender] = true;
        participants.push(msg.sender);
        currentParticipants++;
        
        emit TaskSubmitted(msg.sender, ipfsHash);
    }
    
    /// @dev Verify a user's submission and reward them
    function verifySubmission(address userAddress) external onlyOwner {
        require(hasSubmitted[userAddress], "Campaign: no submission");
        require(!submissions[userAddress].isVerified, "Campaign: already verified");
        
        submissions[userAddress].isVerified = true;
        submissions[userAddress].isRewarded = true;
        
        // Reward tokens
        tokenContract.mint(userAddress, rewardAmount);
        
        emit SubmissionVerified(userAddress, rewardAmount);
    }
    
    /// @dev Deactivate the campaign
    function deactivateCampaign() external onlyOwner {
        isActive = false;
        emit CampaignDeactivated();
    }
    
    /// @dev Get submission details
    function getSubmission(address user) external view returns (Submission memory) {
        return submissions[user];
    }
    
    /// @dev Get all participants
    function getParticipants() external view returns (address[] memory) {
        return participants;
    }
    
    /// @dev Get campaign statistics
    function getCampaignStats() external view returns (uint256, uint256, uint256) {
        uint256 verifiedCount = 0;
        uint256 totalRewards = 0;
        
        for (uint256 i = 0; i < participants.length; i++) {
            if (submissions[participants[i]].isVerified) {
                verifiedCount++;
                totalRewards += rewardAmount;
            }
        }
        
        return (currentParticipants, verifiedCount, totalRewards);
    }
    
    /// @dev Check if a user can submit
    function canSubmit(address user) external view returns (bool) {
        return isActive && !hasSubmitted[user] && currentParticipants < maxParticipants;
    }
}
