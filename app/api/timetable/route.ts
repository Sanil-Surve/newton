import { NextResponse } from "next/server"
import { db, initDatabase, getTimetable } from "@/lib/db"

export async function GET(request: Request) {
  try {
    initDatabase()
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId") || "cls-10a"
    const timetable = getTimetable(classId)
    return NextResponse.json({ success: true, timetable })
  } catch (error: any) {
    console.error("GET /api/timetable error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    initDatabase()
    const {
      id,
      class_id,
      day_of_week,
      period_number,
      start_time,
      end_time,
      subject_id,
      teacher_id,
      room,
    } = await request.json()

    if (!class_id || !day_of_week || !period_number || !subject_id || !teacher_id) {
      return NextResponse.json(
        { success: false, error: "Missing required timetable fields" },
        { status: 400 }
      )
    }

    const timetableId = id || `tt-${Date.now()}`
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO timetables (
        id, class_id, day_of_week, period_number, start_time, end_time, subject_id, teacher_id, room
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      timetableId,
      class_id,
      day_of_week,
      period_number,
      start_time || "09:00",
      end_time || "09:50",
      subject_id,
      teacher_id,
      room || "Room 101"
    )

    return NextResponse.json({ success: true, id: timetableId, message: "Timetable slot updated" })
  } catch (error: any) {
    console.error("POST /api/timetable error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    initDatabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 })
    }
    db.prepare("DELETE FROM timetables WHERE id = ?").run(id)
    return NextResponse.json({ success: true, message: "Slot deleted" })
  } catch (error: any) {
    console.error("DELETE /api/timetable error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
