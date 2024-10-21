// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.4 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract BookadotTicket is ERC721Enumerable {
    uint32 private nftId = 0;
    string private baseUri;
    address private owner;

    mapping(address => bool) private operator;
    mapping(address => bool) private transferables;

    event ChangedBaseURI(string oldBaseUri, string newBaseUri);

    constructor(
        string memory _nftName,
        string memory _nftSymbol,
        string memory _baseUri,
        address _owner,
        address _transferable,
        address _operator
    ) ERC721(_nftName, _nftSymbol) {
        baseUri = _baseUri;
        operator[_operator] = true;
        owner = _owner;
        transferables[_transferable] = true;
    }

    function setBaseUri(string memory _baseUri) external onlyOwner {
        require(bytes(_baseUri).length > 0, "Base URI is required");
        string memory oldBaseUri = baseUri;
        baseUri = _baseUri;
        emit ChangedBaseURI(oldBaseUri, _baseUri);
    }

    function updateOperator(address _operator, bool _persmission) external onlyOwner {
        require(_operator != address(0), "Operator must not be zero address");
        require(operator[_operator] != _persmission, "Operator already added");
        operator[_operator] = _persmission;
    }

    function setTransferable(address _transferable, bool _persmission) external onlyOwner {
        require(transferables[_transferable] != _persmission, "Value unchanged");
        transferables[_transferable] = _persmission;
    }

    function mint(address _receiver) public onlyOperator returns (uint256 id) {
        unchecked {
            nftId++;
        }
        id = nftId;
        _safeMint(_receiver, nftId);
    }

    function burn(uint256 _id) external onlyOperator {
        _burn(_id);
    }

    function getTokenOf(address _address) external view returns (uint256[] memory _tokens) {
        require(_address != address(0), "Address can not be zero address");
        uint256 arrayLength = balanceOf(_address);
        _tokens = new uint256[](arrayLength);

        for (uint256 index = 0; index < arrayLength; index++) {
            uint256 _nftId = tokenOfOwnerByIndex(_address, index);
            if (_nftId == 0) {
                continue;
            }
            _tokens[index] = _nftId;
        }
    }

    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(baseUri, Strings.toString(_tokenId)));
    }

    function transferFrom(address from, address to, uint256 tokenId) public override(ERC721) {
        require(transferables[from] || transferables[to], "disabled");
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not approved or owner");
        _transfer(from, to, tokenId);
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public override(ERC721) {
        require(transferables[from] || transferables[to], "disabled");
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not approved or owner");
        _safeTransfer(from, to, tokenId, _data);
    }

    modifier onlyOperator() {
        require(operator[_msgSender()], "Caller is not operator");
        _;
    }

    modifier onlyOwner() {
        require(_msgSender() == owner, "Caller is not owner");
        _;
    }
}
