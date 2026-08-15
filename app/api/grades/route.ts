import { NextResponse } from "next/server"
import { db, initDatabase, getGradesForExam, calculateGrade } from "@/lib/db"

export async function GET(request: Request) {
  try {
    initDatabase()
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId") || "cls-10a"
    const examId = searchParams.get("examId") || "exam-fin-2025"
    const subjectId = searchParams.get("subjectId") || "sub-math10"

    const grades = getGradesForExam(classId, examId, subjectId)
    return NextResponse.json({ success: true, classId, examId, subjectId, grades })
  } catch (error: any) {
    console.error("GET /api/grades error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    initDatabase()
    const { exam_id, subject_id, records } = await request.json()

    if (!exam_id || !subject_id || !Array.isArray(records)) {
      return NextResponse.json(
        { success: false, error: "Exam ID, subject ID, and grade records are required" },
        { status: 400 }
      )
    }

    const upsertStmt = db.prepare(`
      INSERT INTO grades (
        id, student_id, exam_id, subject_id, marks_obtained, total_marks, grade_point, letter_grade, remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(student_id, exam_id, subject_id) DO UPDATE SET
        marks_obtained = excluded.marks_obtained,
        total_marks = excluded.total_marks,
        grade_point = excluded.grade_point,
        letter_grade = excluded.letter_grade,
        remarks = excluded.remarks
    `)

    const saveBatch = db.transaction((recs: any[]) => {
      let saved = 0
      for (const rec of recs) {
        if (rec.marks_obtained !== undefined && rec.marks_obtained !== null && rec.marks_obtained !== "") {
          const marks = Number(rec.marks_obtained)
          const total = Number(rec.total_marks || 100)
          const { point, letter } = calculateGrade(marks, total)
          const id = rec.id || `gr-${Date.now()}-${Math.floor(Math.random() * 1000)}`

          upsertStmt.run(
            id,
            rec.student_id,
            exam_id,
            subject_id,
            marks,
            total,
            point,
            letter,
            rec.remarks || (marks >= 85 ? "Good performance" : "Requires improvement")
          )
          saved++
        }
      }
      return saved
    })

    const count = saveBatch(records)
    return NextResponse.json({ success: true, count, message: `Grades recorded for ${count} students.` })
  } catch (error: any) {
    console.error("POST /api/grades error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
