import { readFile } from "node:fs/promises"
import path from "node:path"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET(_request: Request, context: { params: Promise<{ attachmentId: string }> }) {
  const { attachmentId } = await context.params

  try {
    const rows = await prisma.$queryRaw<{
      original_file_name: string
      storage_path: string
      mime_type: string | null
    }[]>`
      SELECT original_file_name, storage_path, mime_type
      FROM workflow.jobbing_order_attachment
      WHERE jobbing_order_attachment_id = ${BigInt(attachmentId)}
      LIMIT 1
    `

    const file = rows[0]
    if (!file) {
      return NextResponse.json({ error: "Attachment not found." }, { status: 404 })
    }

    const data = await readFile(file.storage_path)
    return new NextResponse(data, {
      headers: {
        "Content-Type": file.mime_type ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="${path.basename(file.original_file_name)}"`,
      },
    })
  } catch {
    return NextResponse.json({ error: "Attachment could not be downloaded." }, { status: 500 })
  }
}
