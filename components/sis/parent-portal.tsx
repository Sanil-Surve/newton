"use client"

import React, { useEffect, useState } from "react"
import {
  Calendar,
  CheckCircle2,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
  UserCheck,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ParentPortalProps {
  onOpenReportCard: (studentId: string) => void
}

export function ParentPortal({ onOpenReportCard }: ParentPortalProps) {
  const [student, setStudent] = useState<any | null>(null)

  useEffect(() => {
    fetch("/api/students/stu-1")
      .then((r) => r.json())
      .then((d) => d.success && setStudent(d.student))
  }, [])

  if (!student) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-xs text-muted-foreground animate-pulse">
          Loading parent portal records...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Parent Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground font-heading">
              Parent &amp; Guardian Portal
            </h1>
            <Badge variant="secondary" className="text-[10px]">
              Family Access
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Academic standing and daily attendance tracker for your ward: <strong>{student.first_name} {student.last_name}</strong>.
          </p>
        </div>

        <Button
          onClick={() => onOpenReportCard(student.id)}
          className="h-8 gap-1.5 text-xs font-medium self-start sm:self-auto shadow-xs"
        >
          <FileText className="size-3.5" />
          <span>Download Official Report Card</span>
        </Button>
      </div>

      {/* Ward Overview & Contact Teacher */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-sm font-semibold">
              Ward Academic &amp; Attendance Standing
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg border border-border p-3 bg-muted/20">
                <p className="text-muted-foreground text-[10px]">Current GPA</p>
                <p className="text-xl font-bold text-foreground mt-1">3.95</p>
                <p className="text-[10px] text-emerald-600 font-medium">Honor Roll</p>
              </div>
              <div className="rounded-lg border border-border p-3 bg-muted/20">
                <p className="text-muted-foreground text-[10px]">Attendance</p>
                <p className="text-xl font-bold text-emerald-600 mt-1">
                  {student.attendanceStats?.percentage || 95}%
                </p>
                <p className="text-[10px] text-muted-foreground">Good Standing</p>
              </div>
              <div className="rounded-lg border border-border p-3 bg-muted/20">
                <p className="text-muted-foreground text-[10px]">Courses Completed</p>
                <p className="text-xl font-bold text-foreground mt-1">
                  {student.grades?.length || 6}
                </p>
                <p className="text-[10px] text-muted-foreground">100% Pass Rate</p>
              </div>
            </div>

            {/* Subject Summary */}
            <div className="rounded-lg border border-border/60 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/40">
                  <tr>
                    <th className="p-2.5">Subject</th>
                    <th className="p-2.5 text-center">Grade</th>
                    <th className="p-2.5">Teacher Evaluation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {student.grades?.map((g: any) => (
                    <tr key={g.id}>
                      <td className="p-2.5 font-semibold text-foreground">
                        {g.subject_name}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className="font-bold text-emerald-600">
                          {g.letter_grade} ({g.marks_obtained}%)
                        </span>
                      </td>
                      <td className="p-2.5 text-muted-foreground text-[11px]">
                        {g.remarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Advisor Contact Card */}
        <Card>
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-sm font-semibold">
              Class Mentor &amp; School Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 ring-1 ring-border">
                <AvatarFallback className="font-bold text-xs bg-muted">
                  MV
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-foreground">
                  {student.class_teacher_name || "Dr. Marcus Vance"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Class Mentor • Grade 10-A
                </p>
              </div>
            </div>

            <div className="space-y-2 border-t border-border/40 pt-3 text-muted-foreground">
              <p className="flex items-center gap-2">
                <Mail className="size-3.5 text-foreground" />
                <span>{student.class_teacher_email || "m.vance@newtonsis.edu"}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="size-3.5 text-foreground" />
                <span>+1 (555) 345-6789</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="size-3.5 text-foreground" />
                <span>Faculty Office #204</span>
              </p>
            </div>

            <div className="rounded-lg bg-muted/40 p-3 text-[11px] text-muted-foreground border-t border-border/40">
              <p className="font-medium text-foreground">Next Conference:</p>
              <p className="mt-0.5">
                Mid-Term Parent-Teacher Meeting on Oct 15, 2025 (4:00 PM - 7:00 PM).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
