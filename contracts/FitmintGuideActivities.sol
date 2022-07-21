// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./FitmintGuideToken.sol";

contract FitmintGuideActivities is Initializable, PausableUpgradeable, OwnableUpgradeable, UUPSUpgradeable {

    using Counters for Counters.Counter;

    FitmintGuideToken private fitmintGuideToken;
    mapping(address => mapping(uint256 => uint8)) private userPostAttempts;

    event ActivityUploaded(address userAddress, string data);
    event AccountTopUp(address userAddress, uint256 calculationAttempts);
    event TokenSold(address userAddress, uint256 totalTokens);

    constructor() {
        _disableInitializers();
    }

    function initialize(address _fitmintGuideToken) public initializer {
        __Pausable_init();
        __Ownable_init();
        __UUPSUpgradeable_init();
        fitmintGuideToken = FitmintGuideToken(_fitmintGuideToken);
    }

    // solhint-disable-next-line no-empty-blocks
    function _authorizeUpgrade(address newImplementation) internal onlyOwner override {}

    function postResults(string memory data) external whenNotPaused {
        // solhint-disable-next-line not-rely-on-time
        uint256 currentDay = block.timestamp / 86400;
        require(userPostAttempts[msg.sender][currentDay] != 1, "You reached the limit");
        if (userPostAttempts[msg.sender][currentDay] > 1) {
            userPostAttempts[msg.sender][currentDay] -= 1;
        } else {
            userPostAttempts[msg.sender][currentDay] = 10;
        }
        emit ActivityUploaded(msg.sender, data);
        fitmintGuideToken.mint(msg.sender, 10 * 10 ** 18);
    }

    function getUserAttempts(address userAddress) external view returns (uint256) {
        // solhint-disable-next-line not-rely-on-time
        uint256 currentDay = block.timestamp / 86400;
        if (userPostAttempts[userAddress][currentDay] == 1) {
            return 0;
        } else if (userPostAttempts[userAddress][currentDay] == 0) {
            return 10;
        } else {
            return userPostAttempts[userAddress][currentDay] - 1;
        }
    }

    function topUp(uint256 amount) external {
        require(fitmintGuideToken.balanceOf(msg.sender) >= amount, "Insufficient FTG balance");
        fitmintGuideToken.burnFrom(msg.sender, amount);
        uint256 calculationAttempts = amount / 10 ** 18;
        emit AccountTopUp(msg.sender, calculationAttempts);
    }

    function buyTokens() public payable {
        require(msg.value > 5 * 10 ** 17);
        uint256 totalTokens = msg.value * 2;
        fitmintGuideToken.mint(msg.sender, totalTokens);
        emit TokenSold(msg.sender, totalTokens);
    }

    function withdraw() external onlyOwner {
        require(address(this).balance > 0, "Insufficient balance");
        (bool success,) = msg.sender.call{value : address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    fallback() external payable {
        buyTokens();
    }

    receive() external payable {
        buyTokens();
    }

}