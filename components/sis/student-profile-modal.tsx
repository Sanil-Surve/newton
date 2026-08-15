"use client"

import React, { useEffect, useState } from "react"
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Printer,
  Shield,
  User,
  UserCheck,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface StudentProfileModalProps {
  studentId: string | null
  onClose: () => void
  onOpenReportCard: (studentId: string) => void
}

export function StudentProfileModal({
  studentId,
  onClose,
  onOpenReportCard,
}: StudentProfileModalProps) {
  const [student, setStudent] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "academics" | "attendance">("overview")

  useEffect(() => {
    if (!studentId) return
    setLoading(true)
    fetch(`/api/students/${studentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStudent(data.student)
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [studentId])

  if (!studentId) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="size-4" />
        </button>

        {loading || !student ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-xs text-muted-foreground animate-pulse">
              Loading student dossier...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header / Bio */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-border/50 pb-5">
              <Avatar className="size-16 ring-2 ring-border">
                <AvatarImage src={student.photo_url} alt={student.first_name} />
                <AvatarFallback className="text-base font-semibold">
                  {student.first_name?.[0]}
                  {student.last_name?.[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground font-heading">
                    {student.first_name} {student.last_name}
                  </h2>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {student.roll_no}
                  </Badge>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      student.status === "Active"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {student.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {student.grade} - Section {student.section} • {student.room} • Mentor: {student.class_teacher_name || "Assigned Faculty"}
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenReportCard(student.id)}
                className="gap-1.5 text-xs self-end sm:self-auto"
              >
                <FileText className="size-3.5" />
                <span>Report Card</span>
              </Button>
            </div>

            {/* Sub-nav Tabs */}
            <div className="flex items-center gap-2 border-b border-border/50 pb-2 text-xs">
              <button
                onClick={() => setActiveTab("overview")}
                className={`rounded-md px-3 py-1 font-medium transition-colors ${
                  activeTab === "overview"
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Profile &amp; Guardian
              </button>
              <button
                onClick={() => setActiveTab("academics")}
                className={`rounded-md px-3 py-1 font-medium transition-colors ${
                  activeTab === "academics"
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Academic Grades ({student.grades?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("attendance")}
                className={`rounded-md px-3 py-1 font-medium transition-colors ${
                  activeTab === "attendance"
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Attendance Log ({student.attendanceStats?.percentage || 95}%)
              </button>
            </div>

            {/* TAB 1: OVERVIEW & GUARDIAN */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Personal Information */}
                <div className="rounded-lg border border-border/60 p-4 space-y-3 bg-muted/10">
                  <h3 className="font-semibold text-foreground flex items-center gap-1.5">
                    <User className="size-3.5" />
                    Personal Information
                  </h3>
                  <div className="space-y-1.5 text-muted-foreground">
                    <p>
                      <span className="text-foreground font-medium">Date of Birth:</span>{" "}
                      {student.dob}
                    </p>
                    <p>
                      <span className="text-foreground font-medium">Gender:</span>{" "}
                      {student.gender}
                    </p>
                    <p className="flex items-center gap-1">
                      <Mail className="size-3 text-muted-foreground" />
                      {student.email}
                    </p>
                    <p className="flex items-center gap-1">
                      <Phone className="size-3 text-muted-foreground" />
                      {student.contact}
                    </p>
                    <p className="flex items-start gap-1">
                      <MapPin className="size-3 text-muted-foreground mt-0.5 shrink-0" />
                      <span>{student.address}</span>
                    </p>
                  </div>
                </div>

                {/* Guardian Details */}
                <div className="rounded-lg border border-border/60 p-4 space-y-3 bg-muted/10">
                  <h3 className="font-semibold text-foreground flex items-center gap-1.5">
                    <Shield className="size-3.5" />
                    Parent / Guardian Contact
                  </h3>
                  <div className="space-y-1.5 text-muted-foreground">
                    <p>
                      <span className="text-foreground font-medium">Guardian:</span>{" "}
                      {student.guardian_name}
                    </p>
                    <p className="flex items-center gap-1">
                      <Phone className="size-3 text-muted-foreground" />
                      {student.guardian_contact}
                    </p>
                    <p className="flex items-center gap-1">
                      <Mail className="size-3 text-muted-foreground" />
                      {student.guardian_email || "N/A"}
                    </p>
                    <p>
                      <span className="text-foreground font-medium">Academic Year:</span>{" "}
                      {student.academic_year}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACADEMIC GRADES */}
            {activeTab === "academics" && (
              <div className="space-y-3">
                <div className="rounded-lg border border-border/60 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/60 text-muted-foreground font-medium border-b border-border/50">
                      <tr>
                        <th className="p-2.5">Subject</th>
                        <th className="p-2.5">Exam Term</th>
                        <th className="p-2.5 text-center">Score</th>
                        <th className="p-2.5 text-center">Grade</th>
                        <th className="p-2.5">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {student.grades?.map((g: any) => (
                        <tr key={g.id} className="hover:bg-muted/20">
                          <td className="p-2.5 font-medium text-foreground">
                            {g.subject_name}
                            <span className="block font-mono text-[10px] text-muted-foreground">
                              {g.subject_code} ({g.credits} cr)
                            </span>
                          </td>
                          <td className="p-2.5 text-muted-foreground">
                            {g.exam_title}
                          </td>
                          <td className="p-2.5 text-center font-semibold text-foreground">
                            {g.marks_obtained} / {g.total_marks}
                          </td>
                          <td className="p-2.5 text-center">
                            <span className="rounded bg-muted px-1.5 py-0.5 font-semibold text-foreground">
                              {g.letter_grade} ({g.grade_point})
                            </span>
                          </td>
                          <td className="p-2.5 text-muted-foreground text-[11px]">
                            {g.remarks || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: ATTENDANCE */}
            {activeTab === "attendance" && (
              <div className="space-y-4">
                {/* Stats Summary */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="rounded-lg border border-border/60 p-2.5 bg-muted/20">
                    <p className="text-muted-foreground text-[10px]">Total Days</p>
                    <p className="text-base font-bold text-foreground">
                      {student.attendanceStats?.total_days || 0}
                    </p>
                  </div>
                  <div className="rounded-lg border border-emerald-500/30 p-2.5 bg-emerald-500/5">
                    <p className="text-emerald-600 dark:text-emerald-400 text-[10px]">Present</p>
                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {student.attendanceStats?.present_count || 0}
                    </p>
                  </div>
                  <div className="rounded-lg border border-amber-500/30 p-2.5 bg-amber-500/5">
                    <p className="text-amber-600 dark:text-amber-400 text-[10px]">Late</p>
                    <p className="text-base font-bold text-amber-600 dark:text-amber-400">
                      {student.attendanceStats?.late_count || 0}
                    </p>
                  </div>
                  <div className="rounded-lg border border-rose-500/30 p-2.5 bg-rose-500/5">
                    <p className="text-rose-600 dark:text-rose-400 text-[10px]">Absent</p>
                    <p className="text-base font-bold text-rose-600 dark:text-rose-400">
                      {student.attendanceStats?.absent_count || 0}
                    </p>
                  </div>
                </div>

                {/* Log list */}
                <div className="rounded-lg border border-border/60 max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/60 text-muted-foreground font-medium border-b border-border/50 sticky top-0">
                      <tr>
                        <th className="p-2">Date</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {student.attendance?.map((a: any) => (
                        <tr key={a.id}>
                          <td className="p-2 font-mono text-[11px] text-foreground">
                            {a.date}
                          </td>
                          <td className="p-2">
                            <span
                              className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                                a.status === "Present"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : a.status === "Absent"
                                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                  : a.status === "Late"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                  : "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                              }`}
                            >
                              {a.status}
                            </span>
                          </td>
                          <td className="p-2 text-muted-foreground text-[11px]">
                            {a.remarks || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
