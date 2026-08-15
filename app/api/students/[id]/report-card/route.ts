import { NextResponse } from "next/server"
import { db, initDatabase, getStudentById } from "@/lib/db"

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    initDatabase()
    const { id } = await props.params
    const { searchParams } = new URL(request.url)
    const examId = searchParams.get("examId") || "exam-fin-2025"

    const student = getStudentById(id)
    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 })
    }

    const exam = db.prepare("SELECT * FROM exams WHERE id = ?").get(examId) as any

    const examGrades = db.prepare(`
      SELECT 
        g.*,
        s.code as subject_code,
        s.name as subject_name,
        s.credits,
        s.department
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      WHERE g.student_id = ? AND g.exam_id = ?
      ORDER BY s.name ASC
    `).all(id, examId)

    // Compute Term GPA & Overall Stats
    let totalCredits = 0
    let totalWeightedPoints = 0
    let totalMarksObtained = 0
    let totalMaxMarks = 0

    examGrades.forEach((g: any) => {
      const cred = g.credits || 3
      totalCredits += cred
      totalWeightedPoints += (g.grade_point || 0) * cred
      totalMarksObtained += g.marks_obtained || 0
      totalMaxMarks += g.total_marks || 100
    })

    const termGPA = totalCredits > 0 ? (totalWeightedPoints / totalCredits).toFixed(2) : "0.00"
    const overallPercentage =
      totalMaxMarks > 0 ? ((totalMarksObtained / totalMaxMarks) * 100).toFixed(1) : "0.0"

    // Historical comparison (terms)
    const history = db.prepare(`
      SELECT 
        e.id as exam_id,
        e.title as exam_title,
        e.term,
        ROUND(AVG(g.grade_point), 2) as gpa,
        ROUND(AVG(g.marks_obtained * 100.0 / g.total_marks), 1) as avg_percentage
      FROM grades g
      JOIN exams e ON g.exam_id = e.id
      WHERE g.student_id = ?
      GROUP BY e.id
      ORDER BY e.start_date ASC
    `).all(id)

    return NextResponse.json({
      success: true,
      reportCard: {
        student,
        exam: exam || { title: "Term Assessment", term: "2025-2026" },
        grades: examGrades,
        summary: {
          termGPA,
          overallPercentage,
          totalCredits,
          totalSubjects: examGrades.length,
          attendanceRate: student.attendanceStats?.percentage || 95,
        },
        history,
      },
    })
  } catch (error: any) {
    console.error("GET /api/students/[id]/report-card error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
