import Image from "next/image"
import CollectionDisplayView from "./CollectionDisplayView"
import publicConfig from "../../publicConfig"
import { getImageSrcFromMetadataViewsFile } from "../../lib/utils"
import { useState } from "react"

export default function CollectionView(props) {
  const { collection } = props

  const [showNFTs, setShowNFTs] = useState(false)
  const [needRelink, setNeedRelink] = useState(false)

  return (
    <div className="flex flex-col min-w-[1076px] gap-y-3 p-4 shadow-md rounded-2xl bg-white">

      <div className="flex gap-x-3 justify-between">
        <div className="flex items-center gap-x-3">
          <div className="w-11 rounded-full overflow-hidden aspect-square relative">
            <Image src={collection.squareImage ? getImageSrcFromMetadataViewsFile(collection.squareImage.file) : "/token_placeholder.png"} alt="" fill sizes="10vw" priority={true} />
          </div>
          <div className="flex flex-col w-full">
            {
              collection.collectionIdentifier ?
                <label className="text-lg font-bold">
                  {`${collection.collectionIdentifier} (${collection.tokenIDs.length})`}
                </label>
                : <label className="font-bold text-lg">{`${collection.contractName} (${collection.tokenIDs.length})`}</label>
            }
            <label>
              {
                collection.collectionIdentifier ?
                  <a
                    href={`${publicConfig.flowscanURL}/contract/A.${collection.contractAddress}.${collection.contractName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-sm font-bold decoration-drizzle decoration-2">
                    {`A.${collection.contractAddress}.${collection.contractName}`}
                  </a> : collection.path
              }

            </label>
          </div>
        </div>
        <div className="flex gap-x-1 items-center">
          <button
            type="button"
            className={"text-black bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm rounded-2xl font-semibold shrink-0"}
            onClick={async () => {
              setShowNFTs(!showNFTs)
            }}
          >
            {
              showNFTs ? "Hide NFTs" : "Show NFTs"
            }
          </button>
          {
            collection.collectionIdentifier ?
              <label className={`cursor-pointer text-white bg-catalog hover:bg-catalog-dark px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}>
                <a href={`${publicConfig.nftCatalogURL}/${collection.collectionIdentifier}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on NFTCatalog
                </a>
              </label> : null
          }
        </div>
      </div>
      {
        showNFTs && collection.collectionIdentifier && needRelink ?
          <label className="text-rose-500">This collection need&nbsp;
            <a href={`${publicConfig.linkURL}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-bold decoration-drizzle decoration-2"
            >
              {`RELINK`}
            </a>
            &nbsp;to show the metadata</label> : null
      }
      {
        showNFTs ?
          <CollectionDisplayView collection={collection} setNeedRelink={setNeedRelink} /> : null
      }
    </div>
  )
}