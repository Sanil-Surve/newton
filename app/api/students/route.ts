import { NextResponse } from "next/server"
import { db, initDatabase, getAllStudents } from "@/lib/db"

export async function GET(request: Request) {
  try {
    initDatabase()
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")
    const status = searchParams.get("status")
    const query = searchParams.get("query")

    let sql = `
      SELECT 
        s.*,
        c.grade,
        c.section,
        c.room,
        (
          SELECT ROUND(
            (COUNT(CASE WHEN a.status IN ('Present', 'Late') THEN 1 END) * 100.0) / NULLIF(COUNT(*), 0),
            1
          )
          FROM attendance a WHERE a.student_id = s.id
        ) as attendance_rate,
        (
          SELECT ROUND(AVG(g.grade_point), 2)
          FROM grades g WHERE g.student_id = s.id AND g.exam_id = 'exam-fin-2025'
        ) as current_gpa
      FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE 1=1
    `
    const params: any[] = []

    if (classId && classId !== "all") {
      sql += " AND s.class_id = ?"
      params.push(classId)
    }

    if (status && status !== "all") {
      sql += " AND s.status = ?"
      params.push(status)
    }

    if (query) {
      sql += " AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.roll_no LIKE ? OR s.email LIKE ?)"
      const wild = `%${query}%`
      params.push(wild, wild, wild, wild)
    }

    sql += " ORDER BY s.roll_no ASC"

    const students = db.prepare(sql).all(...params)
    return NextResponse.json({ success: true, students })
  } catch (error: any) {
    console.error("GET /api/students error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    initDatabase()
    const body = await request.json()
    const {
      first_name,
      last_name,
      roll_no,
      email,
      dob,
      gender,
      contact,
      address,
      photo_url,
      class_id,
      guardian_name,
      guardian_contact,
      guardian_email,
      status = "Active",
    } = body

    if (!first_name || !last_name || !roll_no || !dob || !gender || !class_id) {
      return NextResponse.json(
        { success: false, error: "Required student fields are missing" },
        { status: 400 }
      )
    }

    const id = `stu-${Date.now()}`
    const defaultPhoto =
      photo_url ||
      (gender === "Female"
        ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        : "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150")

    const stmt = db.prepare(`
      INSERT INTO students (
        id, roll_no, first_name, last_name, email, dob, gender, contact,
        address, photo_url, class_id, guardian_name, guardian_contact, guardian_email, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      roll_no,
      first_name,
      last_name,
      email || `${first_name.toLowerCase()}.${last_name.toLowerCase()}@student.newtonsis.edu`,
      dob,
      gender,
      contact || "+1 (555) 000-0000",
      address || "N/A",
      defaultPhoto,
      class_id,
      guardian_name || "N/A",
      guardian_contact || contact || "+1 (555) 000-0000",
      guardian_email || "",
      status
    )

    return NextResponse.json({ success: true, id, message: "Student created successfully" })
  } catch (error: any) {
    console.error("POST /api/students error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
