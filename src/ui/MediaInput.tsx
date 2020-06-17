import Compressor from "compressorjs"
import { getIn } from "formik"
import React from "react"

import { deleteFile, getFilePath, uploadBlob, uploadFile } from "../firebase/storage"
import { FormHook, useErrorMessage, useFormFromContext } from "../form"
import { guid } from "../utils/guid"
import { LoggerHook, useLogger } from "../utils/logger/useLogger"
import { Button } from "./Button"
import { FormFieldError } from "./FormFieldError"
import { FormFieldHint } from "./FormFieldHint"
import { FormFieldLabel } from "./FormFieldLabel"
import { Icon } from "./Icon"
import { Row } from "./Row"
import { useTheme } from "./Theme"

interface CompressedImage {
  blob: Blob
  width: number
  height: number
}

// function getCompressionRatioPercent(sizeBefore: number, sizeAfter: number): string {
//   const ratio = (100 * sizeAfter) / sizeBefore
//   return ratio.toFixed(1) + "%"
// }

// function getSize(size: number): string {
//   const value = size / 1024
//   return value.toFixed(1) + "kb"
// }

function compress(image: File, quality = 0.8, width?: number): Promise<CompressedImage> {
  console.time("Compressing width: " + (width || "auto"))
  return new Promise<CompressedImage>((resolve, reject) => {
    const c: any = new Compressor(image, {
      quality,
      width,
      checkOrientation: true,
      success(blob) {
        console.timeEnd("Compressing width: " + (width || "auto"))
        const img = c.image
        const ratio = img.width / (width || img.width)
        // const width = c.image.width
        // const height = c.image.height
        resolve({
          blob,
          width: Math.floor(img.width / ratio),
          height: Math.floor(img.height / ratio),
        })
      },
      error(err) {
        reject(err)
      },
    })
  })
}

function getStatus(value: MediaItemDef): MediaFieldStatus {
  if (value && value.loading) return value.deleting ? "deleting" : "loading"
  if (value && value.src) return "file"
  return "empty"
}

/**
 * Gets the extension of the given file.
 */
function getExtension(fileName: string): string | null {
  const segments = fileName.split(".")
  if (segments.length <= 1) return null
  return segments[segments.length - 1]
}

function getSrcSet(media: MediaItemDef): string | undefined {
  if (!media.srcSet) return undefined
  return media.srcSet.map((s) => s.url + " " + s.width + "w").join(", ")
}

function getValues(form: FormHook<any>, name: string, maxImages?: number): MediaDef {
  const val = getIn(form.values, name)
  const result = Array.isArray(val) ? val : val ? [val] : [{}]
  if (maxImages) {
    if (maxImages < 0 || result.length < maxImages) {
      const last = result.length > 0 && result[result.length - 1]
      // list of images + we're not at the maximum, check if the last item is empty, if not, add an empty item
      if (result.length === 0 || (last && Object.keys(last).length > 0)) return result.concat({})
      return result
    }
  } else if (result.length === 0) {
    // single image, but empty array in database
    return [{}]
  }

  return result
}

function getStatuses(values: MediaDef): MediaFieldStatus[] {
  return values.map(getStatus)
}

function replaceLastItem(values: MediaDef, item: MediaItemDef): MediaDef {
  if (values.length === 0) return [item]
  return values.map((m, i) => (i === values.length - 1 ? item : m))
}

//
// -----------------------------------------------------
//

const MIN_SIZE = 60
const MAX_UNCOMPRESSED_FILE_SIZE = 10000
// 2MB
const MAX_SIZE_SMALL_FILE = 2000000

interface MediaFileHookPayload {
  name: string
  folder?: string
  preserve?: boolean
  /** Only works for images, not videos */
  width?: number
  maxImages?: number
  hd?: boolean
  validate?(file: File): string | null
}

export type MediaFieldStatus = "empty" | "loading" | "deleting" | "file"

export interface MediaFileHook {
  name: string
  values: MediaDef
  statuses: MediaFieldStatus[]
  onChange(e): Promise<void>
  deleteFile(index: number): Promise<void>
  cancelUpload(index: number)
  loading: boolean
  loadingLargeFile: boolean
}

export function useMediaFile(payload: MediaFileHookPayload, form: FormHook<any>): MediaFileHook {
  const { name, folder, preserve, maxImages, hd } = payload
  const canceling = React.useRef<boolean>(false)
  const logger = useLogger()
  const values = getValues(form, name, maxImages)
  const statuses = getStatuses(values)

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files[0]

    const errorMessage = payload.validate ? payload.validate(file) : undefined
    if (errorMessage) {
      form.setFieldTouched(name, true, false)
      form.setFieldValue(name, {}, false)
      form.setFieldError(name, errorMessage)
      return
    }

    const path = getFilePath(file, { folder, preserve })
    form.setFieldValue(name, replaceLastItem(values, { loading: true, size: file.size, path }), false)
    form.setFieldError(name, undefined)

    // console.log("Start uploading at path " + path)
    try {
      if (
        file.size < MAX_UNCOMPRESSED_FILE_SIZE ||
        !file.type.startsWith("image/") ||
        file.type === "image/svg" ||
        file.type === "image/svg+xml" ||
        file.type === "image/gif"
      ) {
        // do not compress svgs
        // not an image, just upload
        logger.setLoading(true)
        const { url, path } = await uploadFile(file, { folder, preserve })
        const value: MediaItemDef = {
          mimeType: file.type,
          src: {
            name: file.name,
            path,
            url,
            size: file.size,
          },
        }

        if (canceling.current) {
          // cancelled, delete the file in the background
          deleteFile(path)
          // console.log("Cancelled, deleting file!")
        } else {
          form.setFieldValue(name, replaceLastItem(values, value), false)
          // submit the document if editing
          if (form.document && form.document.exists) {
            await form.submitForm()
          }
          logger.setLoading(false)
          // console.log("Done uploading")
        }
        return
      }

      // compute file name, extension, folder
      logger.setLoading(true)
      const extension = getExtension(file.name)
      const fileName = preserve ? file.name.substr(0, file.name.length - extension.length - 1) : guid()
      const folderName = folder ? (folder.endsWith("/") ? folder : folder + "/") : ""

      // compress / reduce image size
      const quality = hd ? 0.95 : 0.8
      const one = await compress(file, quality, payload.width)
      const baseWidth = payload.width || one.width
      const srcs: CompressedImage[] = []
      if (one.width >= 2 * MIN_SIZE) {
        const res = await compress(file, quality, baseWidth / 2)
        srcs.push(res)
      }
      if (one.width >= 4 * MIN_SIZE) {
        const res = await compress(file, quality, baseWidth / 4)
        srcs.push(res)
      }
      if (one.width >= 8 * MIN_SIZE) {
        const res = await compress(file, quality, baseWidth / 8)
        srcs.push(res)
      }

      // upload files
      const srcSet = await Promise.all(
        [one, ...srcs]
          .filter((src) => !!src)
          .map<Promise<SrcSetItemDef>>(async (img, index) => {
            const { blob, width, height } = img

            const name = index ? fileName + "_" + (index + 1) : fileName
            const ext = ".jpg"
            const path = folderName + name + ext
            console.time("Uploading image width: " + width + "  size: " + blob.size)
            const uploaded = await uploadBlob({ blob, path, contentType: "image/jpeg" })
            console.timeEnd("Uploading image width: " + width + "  size: " + blob.size)
            return {
              name: name + ext,
              path,
              size: blob.size,
              url: uploaded.url,
              width,
              height,
            }
          })
      )

      const media: MediaItemDef = {
        src: srcSet[0],
        srcSet,
        mimeType: "image/jpeg",
      }

      if (canceling.current) {
        // cancelled, delete the files in the background
        srcSet.map((item) => deleteFile(item.path))
        // console.log("Cancelled, deleting files!")
        canceling.current = false
      } else {
        form.setFieldValue(name, replaceLastItem(values, media), false)
        // submit the document if editing
        if (form.document && form.document.exists) {
          await form.submitForm()
        }
        logger.setLoading(false)
        // console.log("Done uploading")
      }
    } catch (err) {
      console.error("Error while uploading files: ", err)
      form.setFieldError(name, err.message || err)
      form.setFieldValue(name, values, false)
      logger.setLoading(false)
    }
  }

  function cancelUpload(index: number) {
    console.log("Canceling for index " + index)
    const value = values.map((m, i) => (i === index ? {} : m))
    const length = value.length
    if (length >= 2) {
      // check if the 2 last items are empty
      if (Object.keys(value[length - 1]).length === 0 && Object.keys(value[length - 2]).length === 0) {
        // if so, remove the last one
        value.pop()
      }
    }
    form.setFieldValue(name, value, false)
    canceling.current = true
    logger.setLoading(false)
  }

  async function onDeleteFile(index: number) {
    const value = values[index]
    if (getStatus(value) !== "file" || !value) {
      return
    }

    const { src, srcSet } = value
    const srcs = srcSet || [src]

    form.setFieldValue(
      name,
      values.map((v, i) => (i === index ? { src, srcSet, loading: true, deleting: true } : v))
    )
    form.setFieldError(name, undefined)

    try {
      await Promise.all(srcs.map((src) => deleteFile(src.path)))
      form.setFieldValue(
        name,
        values.filter((_, i) => i !== index)
      )

      if (form.document && form.document.exists) {
        await form.submitForm()
      }
    } catch (err) {
      console.error("Error while deleting file. ", err)
      form.setFieldError(name, err.message || err)
      form.setFieldValue(name, values)
    }
  }

  const loading = statuses.reduce((prev, curr) => prev || curr === "loading", false)
  const loadingLargeFile = values.reduce(
    (prev, curr) => prev || (curr.loading && curr.size > MAX_SIZE_SMALL_FILE),
    false
  )
  return {
    name,
    values,
    statuses,
    onChange,
    deleteFile: onDeleteFile,
    cancelUpload,
    loading,
    loadingLargeFile,
  }
}

//
// -----------------------------------------------------
//

interface RawSingleMediaInputProps {
  file: MediaFileHook
  index: number
  accept?: string
  buttonClassName?: string
  sizeFull?: boolean
}

function RawSingleMediaInput(props: RawSingleMediaInputProps) {
  const { file, index, accept, buttonClassName, sizeFull } = props
  const media = file.values[index]
  const status = file.statuses[index]
  // const status: any = "loading"
  const name = file.name + "." + index
  const item = file.values[index]

  switch (status) {
    case "file":
      return (
        <div className={"relative mr-2 " + (sizeFull ? "h-full w-full" : "h-20 w-20")}>
          <Button
            style="icon"
            className={
              "bg-white absolute border rounded w-20 h-20 focus:outline-none focus:shadow-outline hover:opacity-75 " +
              buttonClassName
            }
            //onClick={() => file.deleteFile(index)}
            disabled={file.loading}
          >
            <input
              className="absolute top-0 left-0 appearance-none cursor-pointer focus:outline-none focus:shadow-outline opacity-0 w-full h-full"
              type="file"
              name={name}
              autoComplete="off"
              accept={accept || "image/*, video/*, video/mp4,video/x-m4v"}
              onChange={file.onChange}
              disabled={file.loading}
            />
            {!media.mimeType.startsWith("video") && (
              <img
                className="object-cover h-full w-full rounded"
                src={media.src.url}
                srcSet={getSrcSet(media)}
                alt="Uploaded image"
                height={100}
                width={100}
                sizes={256 + "px"}
                style={{ height: "inherit" }}
              />
            )}
            {media.mimeType.startsWith("video") && (
              <video
                className="object-cover h-full w-full rounded"
                src={media.src.url}
                height={100}
                width={100}
                style={{ height: "inherit" }}
                autoPlay
                muted
                loop
              />
            )}
          </Button>
          <Button
            style="unstyled"
            onClick={() => file.deleteFile(index)}
            className="absolute top-0 right-0 text-white hover:text-red-500 m-2"
          >
            <Icon name="trash" size={sizeFull ? "large" : "small"} />
          </Button>
        </div>
      )
    case "loading":
      return (
        <div
          className={
            "bg-white relative border rounded mr-2 cursor-not-allowed " + (sizeFull ? "h-full w-full" : "h-20 w-20")
          }
        >
          <Icon name="loading" size="small" className="absolute top-0 right-0 left-0 my-3 mx-auto opacity-50" />
          {/* {item.size >= MAX_SIZE_SMALL_FILE && (
            <div className="text-xs absolute inset-0 m-auto opacity-75">Large file</div>
          )} */}
          <Button
            style="link"
            className="absolute bottom-0 right-0 left-0 my-1 mx-auto text-xs"
            onClick={() => file.cancelUpload(index)}
          >
            Cancel
          </Button>
        </div>
      )

    case "deleting":
      return (
        <div className={"relative mr-2 " + (sizeFull ? "h-full w-full" : "h-20 w-20")}>
          <Button
            style="icon"
            className={"bg-white relative border rounded mr-2 " + (sizeFull ? "h-full w-full" : "h-20 w-20")}
            disabled
          >
            <img
              className="object-cover h-full w-full rounded"
              src={media.src.url}
              srcSet={getSrcSet(media)}
              alt="Uploaded image"
              height={128}
              width={128}
              sizes={256 + "px"}
              style={{ height: "inherit" }}
            />
            <Icon name="loading" size="xxlarge" className="absolute inset-0 m-2 opacity-75" />
          </Button>
        </div>
      )
    case "empty":
    default:
      return (
        <div
          style={{
            background: 'url("/images/add-outline.svg")',
            backgroundRepeat: "no-repeat",
            backgroundSize: "32px 32px",
            backgroundPosition: "center",
          }}
          className={
            "bg-white border text-lightgray border-dashed rounded mr-2 " + (sizeFull ? "w-full h-full" : "w-20 h-20")
          }
        >
          <input
            className="appearance-none cursor-pointer focus:outline-none focus:shadow-outline opacity-0 w-full h-full"
            type="file"
            name={name}
            autoComplete="off"
            accept={accept || "image/*, video/*, video/mp4, video/x-m4v"}
            onChange={file.onChange}
            disabled={file.loading}
          />
        </div>
      )
  }
}

//
// -----------------------------------------------------
//

interface RawMediaInputProps {
  file: MediaFileHook
  accept?: string
  className?: string
  sizeFull?: boolean
}

function RawMediaInput(props: RawMediaInputProps) {
  const { file, accept, className, sizeFull } = props

  return (
    <Row className={sizeFull ? "w-full h-full" : ""} wrap>
      {file.values.map((_, i) => (
        <RawSingleMediaInput
          file={file}
          index={i}
          accept={accept}
          key={i}
          buttonClassName={className}
          sizeFull={sizeFull}
        />
      ))}
    </Row>
  )
}

//
// -----------------------------------------------------
//

export interface SrcSetItemDef {
  path: string
  name: string
  url: string
  width: number
  size: number
}

export interface MediaItemDef {
  // saved in the server
  src?: Omit<SrcSetItemDef, "width">
  srcSet?: SrcSetItemDef[]
  mimeType?: string

  // only used during input
  loading?: boolean
  deleting?: boolean
  size?: number
  path?: string
}

// We always have list of medias, even for single image/video.
export type MediaDef = MediaItemDef[]

export interface MediaInputProps {
  name: string
  label?: string
  folder?: string
  preserve?: boolean
  /** The number of images/videos to upload, defaults to 1, set <0 for unlimitted. */
  maxImages?: number
  /** Only works for images, not videos */
  width?: number
  accept?: string
  className?: string
  hint?: string
  hd?: boolean
  sizeFull?: boolean
  imageContainerClass?: string
  validate?(file: File): string | null
}

export function MediaInput(props: MediaInputProps) {
  const { name, label, accept, hint, imageContainerClass, sizeFull } = props

  const form = useFormFromContext()
  const errorMessage = useErrorMessage({ form, name })
  const theme = useTheme()
  const file = useMediaFile(props, form)

  return (
    <div className={props.className || theme.form.field.wrapper}>
      <FormFieldLabel label={label} htmlFor={name} />
      <RawMediaInput file={file} accept={accept} className={imageContainerClass} sizeFull={sizeFull} />
      <FormFieldError error={errorMessage} />
      <FormFieldHint
        hint={file.loadingLargeFile ? "Uploading a large file, this may take a while." : hint}
        error={errorMessage}
      />
    </div>
  )
}
