import { NextResponse } from "next/server"
import { db, initDatabase } from "@/lib/db"

export async function GET(request: Request) {
  try {
    initDatabase()
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")

    let sql = `
      SELECT 
        cs.*,
        s.code as subject_code,
        s.name as subject_name,
        s.credits,
        s.department,
        u.name as teacher_name,
        u.email as teacher_email,
        u.avatar_url as teacher_avatar
      FROM class_subjects cs
      JOIN subjects s ON cs.subject_id = s.id
      JOIN users u ON cs.teacher_id = u.id
    `
    const params: any[] = []

    if (classId) {
      sql += " WHERE cs.class_id = ?"
      params.push(classId)
    }

    const assignments = db.prepare(sql).all(...params)
    return NextResponse.json({ success: true, assignments })
  } catch (error: any) {
    console.error("GET /api/class-subjects error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    initDatabase()
    const { class_id, subject_id, teacher_id, periods_per_week = 4 } = await request.json()

    if (!class_id || !subject_id || !teacher_id) {
      return NextResponse.json(
        { success: false, error: "Class, subject, and teacher are required" },
        { status: 400 }
      )
    }

    const id = `cs-${Date.now()}`
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO class_subjects (id, class_id, subject_id, teacher_id, periods_per_week)
      VALUES (?, ?, ?, ?, ?)
    `)

    stmt.run(id, class_id, subject_id, teacher_id, periods_per_week)
    return NextResponse.json({ success: true, id, message: "Course-Teacher assigned successfully" })
  } catch (error: any) {
    console.error("POST /api/class-subjects error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
