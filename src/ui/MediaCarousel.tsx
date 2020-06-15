import React from "react"
import Carousel, { Modal, ModalGateway, ViewType } from "react-images"

import { getSrcSet, MediaDef, MediaItemDef } from "./Media"
import { Row } from "./Row"

const THUMNAIL_SIZE = 64

interface MediaThumbnailProps {
  item: MediaItemDef
  index: number
  setItemOpen(index: number)
}

function MediaThumbnail(props: MediaThumbnailProps) {
  const { item, index, setItemOpen } = props
  return (
    <button onClick={() => setItemOpen(index)}>
      <img
        className=""
        src={item.src.url}
        srcSet={getSrcSet(item)}
        alt="Uploaded image"
        height={THUMNAIL_SIZE}
        width={THUMNAIL_SIZE}
        sizes={THUMNAIL_SIZE + "px"}
        style={{ height: "inherit" }}
      />
    </button>
  )
}

export interface MediaCarouselProps {
  media: MediaDef
}

/**
 * See https://github.com/jossmac/react-images
 */
export function MediaCarousel(props: MediaCarouselProps) {
  const { media } = props
  const [itemOpen, setItemOpen] = React.useState<number>(-1)

  if (!media || media.length === 0 || Object.keys(media[0] || {}).length === 0) {
    return <div />
  }

  const views: ViewType[] = media.map((m) => m && m.src && { source: m.src.url }).filter((v) => !!v)
  return (
    <div>
      <Row wrap>
        {media.map((m, i) => (
          <MediaThumbnail item={m} index={i} setItemOpen={setItemOpen} key={i} />
        ))}
      </Row>
      <ModalGateway>
        {itemOpen >= 0 ? (
          <Modal onClose={() => setItemOpen(-1)}>
            <Carousel views={views} />
          </Modal>
        ) : null}
      </ModalGateway>
    </div>
  )
}
