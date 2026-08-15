import { NextResponse } from "next/server"
import { db, initDatabase } from "@/lib/db"

export async function GET(request: Request) {
  try {
    initDatabase()
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")

    let filterClause = ""
    const params: any[] = []
    if (classId && classId !== "all") {
      filterClause = "WHERE s.class_id = ?"
      params.push(classId)
    }

    // Overall stats
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN a.status = 'Present' THEN 1 END) as present_count,
        COUNT(CASE WHEN a.status = 'Late' THEN 1 END) as late_count,
        COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) as absent_count,
        COUNT(CASE WHEN a.status = 'Excused' THEN 1 END) as excused_count,
        ROUND(
          (COUNT(CASE WHEN a.status IN ('Present', 'Late') THEN 1 END) * 100.0) / NULLIF(COUNT(*), 0),
          1
        ) as average_rate
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      ${filterClause}
    `).get(...params)

    // Low attendance students (< 75%)
    const lowAttendanceStudents = db.prepare(`
      SELECT 
        s.id,
        s.roll_no,
        s.first_name,
        s.last_name,
        s.photo_url,
        s.guardian_name,
        s.guardian_contact,
        c.grade,
        c.section,
        COUNT(a.id) as total_days,
        COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) as absent_days,
        ROUND(
          (COUNT(CASE WHEN a.status IN ('Present', 'Late') THEN 1 END) * 100.0) / NULLIF(COUNT(a.id), 0),
          1
        ) as attendance_percentage
      FROM students s
      JOIN classes c ON s.class_id = c.id
      JOIN attendance a ON a.student_id = s.id
      ${filterClause}
      GROUP BY s.id
      HAVING attendance_percentage < 75.0
      ORDER BY attendance_percentage ASC
    `).all(...params)

    return NextResponse.json({
      success: true,
      stats,
      lowAttendanceStudents,
    })
  } catch (error: any) {
    console.error("GET /api/attendance/summary error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
