pragma solidity ^0.5.0;

contract SimpleStorage {
  uint expireBlock;
  string name;

  function set(string memory nameParam) public {
    require(block.number >= expireBlock, 'someone is napping');
    name = nameParam;
    expireBlock = block.number + 80;
  }

  function getName() public view returns (string memory) {
    return name;
  }

  function getExpireBlock() public view returns (uint) {
    return expireBlock;
  }
}
