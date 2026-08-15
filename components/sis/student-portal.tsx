"use client"

import React, { useEffect, useState } from "react"
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Printer,
  Sparkles,
  UserCheck,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface StudentPortalProps {
  onOpenReportCard: (studentId: string) => void
}

export function StudentPortal({ onOpenReportCard }: StudentPortalProps) {
  const [student, setStudent] = useState<any | null>(null)
  const [timetable, setTimetable] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/students/stu-1")
      .then((r) => r.json())
      .then((d) => d.success && setStudent(d.student))

    fetch("/api/timetable?classId=cls-10a")
      .then((r) => r.json())
      .then((d) => d.success && setTimetable(d.timetable))
  }, [])

  if (!student) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-xs text-muted-foreground animate-pulse">
          Loading student academic portal...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Student Welcome Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div className="flex items-center gap-4">
          <Avatar className="size-14 ring-2 ring-border">
            <AvatarImage src={student.photo_url} alt={student.first_name} />
            <AvatarFallback className="text-sm font-bold">
              {student.first_name?.[0]}
              {student.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground font-heading">
                Welcome, {student.first_name}!
              </h1>
              <Badge variant="secondary" className="font-mono text-[10px]">
                {student.roll_no}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {student.grade} - Section {student.section} • Advisor: {student.class_teacher_name}
            </p>
          </div>
        </div>

        <Button
          onClick={() => onOpenReportCard(student.id)}
          className="h-8 gap-1.5 text-xs font-medium self-start sm:self-auto shadow-xs"
        >
          <FileText className="size-3.5" />
          <span>View My Official Transcript</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase text-muted-foreground">
                Term 1 GPA
              </span>
              <GraduationCap className="size-4 text-muted-foreground" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground font-heading">
                3.95
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Dean&apos;s Honor Roll
              </span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground border-t border-border/40 pt-2">
              Rank: Top 5% of Grade 10
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase text-muted-foreground">
                Attendance Rate
              </span>
              <UserCheck className="size-4 text-muted-foreground" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-heading">
                {student.attendanceStats?.percentage || 95}%
              </span>
              <span className="text-xs text-muted-foreground">
                ({student.attendanceStats?.present_count || 19} / {student.attendanceStats?.total_days || 20} days)
              </span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground border-t border-border/40 pt-2">
              1 Excused Absence recorded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase text-muted-foreground">
                Enrolled Subjects
              </span>
              <BookOpen className="size-4 text-muted-foreground" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground font-heading">
                {student.grades?.length || 6}
              </span>
              <span className="text-xs text-muted-foreground">Courses</span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground border-t border-border/40 pt-2">
              21 Total Academic Credits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grade Details Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-sm font-semibold">
            My Course Grades &amp; Teacher Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground font-medium border-b border-border/50">
              <tr>
                <th className="p-3">Course Code</th>
                <th className="p-3">Subject</th>
                <th className="p-3 text-center">Score</th>
                <th className="p-3 text-center">Letter Grade</th>
                <th className="p-3">Faculty Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {student.grades?.map((g: any) => (
                <tr key={g.id} className="hover:bg-muted/20">
                  <td className="p-3 font-mono font-bold text-muted-foreground">
                    {g.subject_code}
                  </td>
                  <td className="p-3 font-semibold text-foreground">
                    {g.subject_name}
                  </td>
                  <td className="p-3 text-center font-bold text-foreground">
                    {g.marks_obtained} / {g.total_marks}
                  </td>
                  <td className="p-3 text-center">
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                      {g.letter_grade} ({g.grade_point})
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground text-[11px]">
                    {g.remarks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
