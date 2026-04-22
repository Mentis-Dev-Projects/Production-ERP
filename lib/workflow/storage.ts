import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { randomUUID } from "node:crypto"

const uploadsRoot = path.join(process.cwd(), "uploads", "workflow")

export async function persistWorkflowFile(file: File) {
  const extension = path.extname(file.name)
  const storedFileName = `${Date.now()}-${randomUUID()}${extension}`
  const targetDir = path.join(uploadsRoot, new Date().toISOString().slice(0, 10))
  const targetPath = path.join(targetDir, storedFileName)

  await mkdir(targetDir, { recursive: true })
  const bytes = Buffer.from(await file.arrayBuffer())
  await writeFile(targetPath, bytes)

  return {
    fileName: storedFileName,
    originalFileName: file.name,
    mimeType: file.type || null,
    fileSizeBytes: bytes.byteLength,
    storagePath: targetPath,
  }
}
