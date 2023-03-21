// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.0;

import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {Arrays} from "@openzeppelin/contracts/utils/Arrays.sol";
import {LSSVMPair1155} from "./LSSVMPair1155.sol";
import {LSSVMRouter} from "./LSSVMRouter.sol";
import {ILSSVMPairFactoryLike} from "./ILSSVMPairFactoryLike.sol";
/**
    @title An NFT/Token pair for an NFT that does not implement ERC721Enumerable
    @author boredGenius and 0xmons
 */
abstract contract LSSVMPair1155MissingEnumerable is LSSVMPair1155 { 
    using Arrays for uint256[];

    uint256[] private idSet;

    /// @inheritdoc LSSVMPair1155
    function _sendSpecificNFTsToRecipient(
        IERC1155 _nft,
        address nftRecipient,
        uint256[] calldata nftIds,
        uint256[] calldata nftCounts
    ) internal override {
        // Send NFTs to caller
        // If missing enumerable, update pool's own ID set
        uint256 numNFTs = nftIds.length;
        for (uint256 i; i < numNFTs; ) {
            _nft.safeTransferFrom(
                address(this),
                nftRecipient,
                nftIds[i],
                nftCounts[i],
                ""
            );
            // Remove from id set
            uint256 toDeleteIndex = idSet.findUpperBound(nftIds[i]);
            require(idSet[toDeleteIndex] == nftIds[i], "Invalid Id");
            uint256 lastIndex = idSet.length - 1;
            if (lastIndex != toDeleteIndex) {
                uint256 lastValue = idSet[lastIndex];
                // Move the last value to the index where the value to delete is
                idSet[toDeleteIndex] = lastValue;
            }
            idSet.pop();

            unchecked {
                ++i;
            }
        }
    }

    /// @inheritdoc LSSVMPair1155
    function getAllHeldIds() external view override returns (uint256[] memory) {
        return idSet;
    }

    /**
        @dev When safeTransfering an ERC1155 in, we add ID to the idSet
        if it's the same collection used by pool. (As it doesn't auto-track because no ERC721Enumerable)
     */
    function onERC1155Received(
        address,
        address,
        uint256 id,
        uint256,
        bytes memory
    ) public virtual returns (bytes4) {
        IERC1155 _nft = nft();
        // If it's from the pair's NFT, add the ID to ID set
        if (msg.sender == address(_nft)) {
            idSet.push(id);
        }
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory nftIds,
        uint256[] memory,
        bytes memory
    ) public virtual returns (bytes4) {
        IERC1155 _nft = nft();
        if (msg.sender == address(_nft)) {
            for (uint i; i < nftIds.length; ) {
                idSet.push(nftIds[i]);

                unchecked {
                    ++i;
                }
            }
        }
        return this.onERC1155BatchReceived.selector;
    }

    /// @inheritdoc LSSVMPair1155
    function withdrawERC1155(
        IERC1155 a,
        uint256[] calldata ids,
        uint256[] calldata amounts
    ) external override onlyOwner {
        IERC1155 _nft = nft();

        if (a != _nft) {
            for (uint i; i < ids.length; ) {
                a.safeTransferFrom(address(this), msg.sender, ids[i], 1, "");
                unchecked {
                    ++i;
                }
            }
        } else {
            for (uint i; i < ids.length; ) {
                a.safeTransferFrom(address(this), msg.sender, ids[i], amounts[i], "");

                // Remove from id set
                uint256 toDeleteIndex = idSet.findUpperBound(ids[i]);
                require(idSet[toDeleteIndex] == ids[i], "Invalid Id");

                uint256 lastIndex = idSet.length - 1;
                if (lastIndex != toDeleteIndex) {
                    uint256 lastValue = idSet[lastIndex];
                    // Move the last value to the index where the value to delete is
                    idSet[toDeleteIndex] = lastValue;
                }

                idSet.pop();


                unchecked {
                    ++i;
                }
            }

            emit NFTWithdrawal();
        }
    }
}
