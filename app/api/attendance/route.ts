import { NextResponse } from "next/server"
import { db, initDatabase, getAttendanceForClass } from "@/lib/db"

export async function GET(request: Request) {
  try {
    initDatabase()
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId") || "cls-10a"
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

    const records = getAttendanceForClass(classId, date)
    return NextResponse.json({ success: true, date, classId, records })
  } catch (error: any) {
    console.error("GET /api/attendance error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    initDatabase()
    const { class_id, date, records, marked_by = "usr-tea-1" } = await request.json()

    if (!class_id || !date || !Array.isArray(records)) {
      return NextResponse.json(
        { success: false, error: "Class ID, date, and attendance records required" },
        { status: 400 }
      )
    }

    const upsertStmt = db.prepare(`
      INSERT INTO attendance (id, student_id, class_id, date, status, remarks, marked_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(student_id, date) DO UPDATE SET
        status = excluded.status,
        remarks = excluded.remarks,
        marked_by = excluded.marked_by
    `)

    const saveBatch = db.transaction((recs: any[]) => {
      let saved = 0
      for (const rec of recs) {
        const id = rec.id || `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        upsertStmt.run(
          id,
          rec.student_id,
          class_id,
          date,
          rec.status || "Present",
          rec.remarks || "",
          marked_by
        )
        saved++
      }
      return saved
    })

    const count = saveBatch(records)
    return NextResponse.json({ success: true, count, message: `Attendance saved for ${count} students.` })
  } catch (error: any) {
    console.error("POST /api/attendance error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
