"use client"

import React, { useEffect, useState } from "react"
import {
  Award,
  BookOpen,
  CheckCircle2,
  FileText,
  GraduationCap,
  Plus,
  Printer,
  Save,
  Search,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { calculateGrade } from "@/lib/grading"

interface GradesViewProps {
  classes: any[]
  onOpenReportCard: (studentId: string, examId?: string) => void
  onRefresh: () => void
}

export function GradesView({
  classes,
  onOpenReportCard,
  onRefresh,
}: GradesViewProps) {
  const [exams, setExams] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("cls-10a")
  const [selectedExam, setSelectedExam] = useState<string>("exam-fin-2025")
  const [selectedSubject, setSelectedSubject] = useState<string>("sub-math10")
  const [gradesList, setGradesList] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/exams")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setExams(d.exams)
      })

    fetch("/api/subjects")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSubjects(d.subjects)
      })
  }, [])

  const loadGrades = () => {
    if (!selectedClass || !selectedExam || !selectedSubject) return
    fetch(
      `/api/grades?classId=${selectedClass}&examId=${selectedExam}&subjectId=${selectedSubject}`
    )
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setGradesList(d.grades)
        }
      })
  }

  useEffect(() => {
    loadGrades()
  }, [selectedClass, selectedExam, selectedSubject])

  const handleMarkChange = (studentId: string, value: string) => {
    const num = value === "" ? "" : Number(value)
    setGradesList((prev) =>
      prev.map((g) => {
        if (g.student_id === studentId) {
          const marks = Number(num) || 0
          const { point, letter } = calculateGrade(marks, 100)
          return {
            ...g,
            marks_obtained: num,
            grade_point: point,
            letter_grade: letter,
          }
        }
        return g
      })
    )
  }

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setGradesList((prev) =>
      prev.map((g) => (g.student_id === studentId ? { ...g, remarks } : g))
    )
  }

  const handleSaveGrades = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam_id: selectedExam,
          subject_id: selectedSubject,
          records: gradesList,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback(`Grades and GPA successfully recorded for ${data.count} students!`)
        setTimeout(() => setFeedback(null), 3000)
        onRefresh()
        loadGrades()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          {feedback}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground font-heading">
            Gradebook &amp; Exam Evaluation
          </h2>
          <p className="text-xs text-muted-foreground">
            Record subject marks, auto-compute GPAs, and generate official student report cards.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleSaveGrades}
          disabled={isSaving || gradesList.length === 0}
          className="h-8 gap-1.5 text-xs font-medium shadow-xs"
        >
          <Save className="size-3.5" />
          <span>{isSaving ? "Saving..." : "Save Gradebook"}</span>
        </Button>
      </div>

      {/* Selection Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-border/70 bg-card p-4 text-xs">
        {/* Exam Selection */}
        <div className="space-y-1">
          <label className="font-medium text-foreground">Term / Exam</label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-xs text-foreground outline-none font-medium"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title} ({ex.term})
              </option>
            ))}
          </select>
        </div>

        {/* Class Selection */}
        <div className="space-y-1">
          <label className="font-medium text-foreground">Class Cohort</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-xs text-foreground outline-none font-medium"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.grade} - Section {c.section}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Selection */}
        <div className="space-y-1">
          <label className="font-medium text-foreground">Subject / Course</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-xs text-foreground outline-none font-medium"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grade Entry Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Mark Entry &amp; Automatic GPA Computation
            </CardTitle>
            <Badge variant="secondary" className="text-[10px]">
              Auto GPA Engine Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-muted/60 text-muted-foreground font-medium border-b border-border/50">
              <tr>
                <th className="p-3">Roll No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3 text-center w-32">Marks (Max 100)</th>
                <th className="p-3 text-center">Letter Grade</th>
                <th className="p-3 text-center">Grade Point</th>
                <th className="p-3">Faculty Remarks</th>
                <th className="p-3 text-right">Report Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {gradesList.length > 0 ? (
                gradesList.map((g) => (
                  <tr key={g.student_id} className="hover:bg-muted/20">
                    <td className="p-3 font-mono font-semibold text-muted-foreground">
                      {g.roll_no}
                    </td>
                    <td className="p-3 font-semibold text-foreground">
                      {g.first_name} {g.last_name}
                    </td>
                    <td className="p-3 text-center">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={g.marks_obtained ?? ""}
                        onChange={(e) =>
                          handleMarkChange(g.student_id, e.target.value)
                        }
                        className="h-7 w-20 text-center font-bold text-xs mx-auto"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`rounded-md px-2 py-0.5 font-bold ${
                          g.letter_grade === "A+" || g.letter_grade === "A"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : g.letter_grade === "F"
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {g.letter_grade || "—"}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-foreground">
                      {g.grade_point !== undefined ? g.grade_point.toFixed(1) : "—"}
                    </td>
                    <td className="p-3">
                      <Input
                        type="text"
                        value={g.remarks || ""}
                        onChange={(e) =>
                          handleRemarksChange(g.student_id, e.target.value)
                        }
                        placeholder="Evaluation feedback..."
                        className="h-7 text-xs"
                      />
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() =>
                          onOpenReportCard(g.student_id, selectedExam)
                        }
                        className="gap-1 text-[11px]"
                      >
                        <FileText className="size-3" />
                        <span>Transcript</span>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground text-xs">
                    No students found for this class and subject configuration.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
