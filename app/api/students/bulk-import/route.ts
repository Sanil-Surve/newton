import { NextResponse } from "next/server"
import { db, initDatabase } from "@/lib/db"

export async function POST(request: Request) {
  try {
    initDatabase()
    const { students } = await request.json()

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid or empty student list" },
        { status: 400 }
      )
    }

    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO students (
        id, roll_no, first_name, last_name, email, dob, gender, contact,
        address, photo_url, class_id, guardian_name, guardian_contact, guardian_email, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const insertMany = db.transaction((rows: any[]) => {
      let inserted = 0
      for (const row of rows) {
        const id = row.id || `stu-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        const defaultPhoto =
          row.gender === "Female"
            ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
            : "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"

        insertStmt.run(
          id,
          row.roll_no || `STU-2025-${Math.floor(100 + Math.random() * 900)}`,
          row.first_name || "Unknown",
          row.last_name || "Student",
          row.email || `${(row.first_name || "student").toLowerCase()}@student.newtonsis.edu`,
          row.dob || "2009-01-01",
          row.gender || "Other",
          row.contact || "+1 (555) 000-0000",
          row.address || "N/A",
          row.photo_url || defaultPhoto,
          row.class_id || "cls-10a",
          row.guardian_name || "Parent/Guardian",
          row.guardian_contact || "+1 (555) 000-0000",
          row.guardian_email || "",
          row.status || "Active"
        )
        inserted++
      }
      return inserted
    })

    const count = insertMany(students)
    return NextResponse.json({ success: true, count, message: `Successfully imported ${count} students.` })
  } catch (error: any) {
    console.error("POST /api/students/bulk-import error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
