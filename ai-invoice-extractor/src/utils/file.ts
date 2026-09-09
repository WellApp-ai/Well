import fs from "node:fs"
import { basename, extname } from "node:path"

export type FileType = "image" | "text" | "file"
export type MimeType =
  | "image/png"
  | "image/jpg"
  | "image/jpeg"
  | "image/gif"
  | "image/webp"
  | "application/pdf"
  | "application/octet-stream"
  | "text/plain"

export const MIMETYPES: Record<string, MimeType> = {
  png: "image/png",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  pdf: "application/pdf",
  txt: "text/plain"
}

/**
 * File utilities.
 */
export const FileUtils = {
  /**
   * Whether the extension maps to a MIME type the extractors accept.
   */
  isSupportedExtension(extension: string): boolean {
    return Object.hasOwn(MIMETYPES, extension)
  },

  supportedExtensions(): string[] {
    return Object.keys(MIMETYPES)
  },

  /**
   * Get file metadata
   * @param path - The path to the file
   * @returns The file metadata
   */
  getMetadata(path: string): {
    path: string
    filename: string
    extension: string
    fileType: FileType
    mimeType: MimeType
  } {
    const filename = basename(path)

    // Determine MIME type from extension
    const extension = extname(path).toLowerCase().slice(1)
    const mimeType = MIMETYPES[extension] || "application/octet-stream"
    const fileType = mimeType.startsWith("image/") ? "image" : mimeType.startsWith("text/") ? "text" : "file"

    return {
      path: path.lastIndexOf("/") === -1 ? "/" : path.substring(0, path.lastIndexOf("/")),
      filename,
      extension,
      fileType,
      mimeType
    }
  },

  /**
   * Read a file
   * @param path - The path to the file
   * @returns The file content as Buffer
   */
  readFile(path: string): Promise<Buffer> {
    return fs.promises.readFile(path)
  },

  /**
   * Read a file
   * @param path - The path to the file
   * @returns The file content as Buffer
   */
  readFileSync(path: string): Buffer {
    return fs.readFileSync(path)
  }
}
