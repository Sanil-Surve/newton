import { NextResponse } from "next/server"
import { db, initDatabase, getExams } from "@/lib/db"

export async function GET() {
  try {
    initDatabase()
    const exams = getExams()
    return NextResponse.json({ success: true, exams })
  } catch (error: any) {
    console.error("GET /api/exams error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    initDatabase()
    const { title, term, academic_year, start_date, end_date, status = "Upcoming" } =
      await request.json()

    if (!title || !term) {
      return NextResponse.json(
        { success: false, error: "Exam title and term are required" },
        { status: 400 }
      )
    }

    const id = `exam-${Date.now()}`
    const stmt = db.prepare(`
      INSERT INTO exams (id, title, term, academic_year, start_date, end_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(id, title, term, academic_year || "2025-2026", start_date || null, end_date || null, status)
    return NextResponse.json({ success: true, id, message: "Exam created successfully" })
  } catch (error: any) {
    console.error("POST /api/exams error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
