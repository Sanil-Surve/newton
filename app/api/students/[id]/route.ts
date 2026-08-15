import { NextResponse } from "next/server"
import { db, initDatabase, getStudentById } from "@/lib/db"

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    initDatabase()
    const { id } = await props.params
    const student = getStudentById(id)
    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, student })
  } catch (error: any) {
    console.error("GET /api/students/[id] error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    initDatabase()
    const { id } = await props.params
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
      status,
    } = body

    const stmt = db.prepare(`
      UPDATE students
      SET 
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        roll_no = COALESCE(?, roll_no),
        email = COALESCE(?, email),
        dob = COALESCE(?, dob),
        gender = COALESCE(?, gender),
        contact = COALESCE(?, contact),
        address = COALESCE(?, address),
        photo_url = COALESCE(?, photo_url),
        class_id = COALESCE(?, class_id),
        guardian_name = COALESCE(?, guardian_name),
        guardian_contact = COALESCE(?, guardian_contact),
        guardian_email = COALESCE(?, guardian_email),
        status = COALESCE(?, status)
      WHERE id = ?
    `)

    stmt.run(
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
      status,
      id
    )

    return NextResponse.json({ success: true, message: "Student updated successfully" })
  } catch (error: any) {
    console.error("PUT /api/students/[id] error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    initDatabase()
    const { id } = await props.params
    db.prepare("DELETE FROM students WHERE id = ?").run(id)
    return NextResponse.json({ success: true, message: "Student deleted successfully" })
  } catch (error: any) {
    console.error("DELETE /api/students/[id] error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
