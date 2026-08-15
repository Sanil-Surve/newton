"use client"

import React, { useEffect, useState } from "react"
import {
  Award,
  Calendar,
  CheckCircle2,
  Download,
  GraduationCap,
  Printer,
  School,
  UserCheck,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ReportCardModalProps {
  studentId: string | null
  examId?: string
  onClose: () => void
}

export function ReportCardModal({
  studentId,
  examId = "exam-fin-2025",
  onClose,
}: ReportCardModalProps) {
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!studentId) return
    setLoading(true)
    fetch(`/api/students/${studentId}/report-card?examId=${examId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setData(res.reportCard)
        }
      })
      .finally(() => setLoading(false))
  }, [studentId, examId])

  if (!studentId) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150 print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-3xl rounded-xl border border-border bg-card p-8 shadow-2xl max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:p-6 print:text-black">
        {/* Modal Controls (Hidden when printing) */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-5 text-foreground" />
            <h2 className="text-sm font-bold text-foreground font-heading">
              Official Academic Transcript &amp; Report Card
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="gap-1.5 text-xs"
            >
              <Printer className="size-3.5" />
              <span>Print / Export PDF</span>
            </Button>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {loading || !data ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-xs text-muted-foreground animate-pulse">
              Compiling academic grades and transcript...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* School Header */}
            <div className="text-center border-b-2 border-foreground/20 pb-5">
              <h1 className="text-xl font-extrabold uppercase tracking-tight text-foreground font-heading">
                Newton Preparatory Academy
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Official Consolidated Student Evaluation Report
              </p>
              <p className="text-[11px] font-mono text-muted-foreground mt-1">
                {data.exam?.title} • Academic Year {data.student?.academic_year || "2025-2026"}
              </p>
            </div>

            {/* Student Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-lg border border-border/70 bg-muted/20 p-4 text-xs">
              <div>
                <p className="text-muted-foreground text-[10px]">Student Name</p>
                <p className="font-bold text-foreground text-xs">
                  {data.student.first_name} {data.student.last_name}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px]">Roll Number</p>
                <p className="font-mono font-bold text-foreground text-xs">
                  {data.student.roll_no}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px]">Class &amp; Section</p>
                <p className="font-semibold text-foreground text-xs">
                  {data.student.grade} - Section {data.student.section}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px]">Term GPA / Pct</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                  {data.summary.termGPA} GPA ({data.summary.overallPercentage}%)
                </p>
              </div>
            </div>

            {/* Grade Table */}
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted text-muted-foreground font-semibold border-b border-border">
                  <tr>
                    <th className="p-3">Course / Subject Code</th>
                    <th className="p-3 text-center">Credits</th>
                    <th className="p-3 text-center">Marks (Max 100)</th>
                    <th className="p-3 text-center">Letter Grade</th>
                    <th className="p-3 text-center">Grade Point</th>
                    <th className="p-3">Faculty Evaluation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {data.grades.map((g: any) => (
                    <tr key={g.id}>
                      <td className="p-3 font-semibold text-foreground">
                        {g.subject_name}
                        <span className="block font-mono text-[10px] text-muted-foreground font-normal">
                          {g.subject_code} • {g.department}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono">
                        {g.credits || 3}
                      </td>
                      <td className="p-3 text-center font-bold text-foreground font-mono">
                        {g.marks_obtained}
                      </td>
                      <td className="p-3 text-center">
                        <span className="rounded bg-muted px-2 py-0.5 font-bold text-foreground">
                          {g.letter_grade}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono font-semibold">
                        {g.grade_point?.toFixed(1)}
                      </td>
                      <td className="p-3 text-muted-foreground text-[11px]">
                        {g.remarks || "Satisfactory progress in foundational competencies."}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cumulative Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-border p-3 text-center bg-muted/10">
                <p className="text-muted-foreground text-[10px]">Total Credits Earned</p>
                <p className="text-base font-bold text-foreground">
                  {data.summary.totalCredits} Credits
                </p>
              </div>
              <div className="rounded-lg border border-border p-3 text-center bg-muted/10">
                <p className="text-muted-foreground text-[10px]">Session Attendance</p>
                <p className="text-base font-bold text-foreground">
                  {data.summary.attendanceRate}%
                </p>
              </div>
              <div className="rounded-lg border border-border p-3 text-center bg-muted/10">
                <p className="text-muted-foreground text-[10px]">Cumulative Standing</p>
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {Number(data.summary.termGPA) >= 3.5 ? "Dean's Honors List" : "Good Standing"}
                </p>
              </div>
            </div>

            {/* Signatures */}
            <div className="flex items-center justify-between pt-8 border-t border-border text-xs text-muted-foreground">
              <div className="text-center">
                <div className="w-36 border-b border-muted-foreground/40 mb-1" />
                <p className="text-[11px] font-medium text-foreground">
                  {data.student.class_teacher_name || "Dr. Marcus Vance"}
                </p>
                <p className="text-[10px]">Class Mentor / Advisor</p>
              </div>

              <div className="text-center">
                <div className="w-36 border-b border-muted-foreground/40 mb-1" />
                <p className="text-[11px] font-medium text-foreground">
                  Eleanor Campbell
                </p>
                <p className="text-[10px]">Principal &amp; Head of School</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
