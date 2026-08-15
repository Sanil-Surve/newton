import { NextResponse } from "next/server"
import { db, initDatabase, getSubjects } from "@/lib/db"

export async function GET() {
  try {
    initDatabase()
    const subjects = getSubjects()
    return NextResponse.json({ success: true, subjects })
  } catch (error: any) {
    console.error("GET /api/subjects error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    initDatabase()
    const { code, name, description, credits, department } = await request.json()

    if (!code || !name) {
      return NextResponse.json(
        { success: false, error: "Subject code and name are required" },
        { status: 400 }
      )
    }

    const id = `sub-${code.toLowerCase().replace(/[^a-z0-9]/g, "")}`
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO subjects (id, code, name, description, credits, department)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    stmt.run(id, code, name, description || "", credits || 3, department || "General")
    return NextResponse.json({ success: true, id, message: "Subject created successfully" })
  } catch (error: any) {
    console.error("POST /api/subjects error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
