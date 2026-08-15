import { NextResponse } from "next/server"
import { db, initDatabase, getClasses } from "@/lib/db"

export async function GET() {
  try {
    initDatabase()
    const classes = getClasses()
    return NextResponse.json({ success: true, classes })
  } catch (error: any) {
    console.error("GET /api/classes error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    initDatabase()
    const { grade, section, room, academic_year, class_teacher_id } = await request.json()

    if (!grade || !section || !room) {
      return NextResponse.json(
        { success: false, error: "Grade, section, and room are required" },
        { status: 400 }
      )
    }

    const id = `cls-${grade.toLowerCase().replace(/\s+/g, "")}-${section.toLowerCase()}`
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO classes (id, grade, section, room, academic_year, class_teacher_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    stmt.run(id, grade, section, room, academic_year || "2025-2026", class_teacher_id || null)
    return NextResponse.json({ success: true, id, message: "Class created successfully" })
  } catch (error: any) {
    console.error("POST /api/classes error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
