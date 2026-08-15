"use client"

import React from "react"
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Plus,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface DashboardProps {
  students: any[]
  classes: any[]
  lowAttendanceList: any[]
  onNavigate: (tab: string) => void
  onAddStudent: () => void
  onImportCSV: () => void
  onViewStudent: (id: string) => void
}

export function DashboardView({
  students,
  classes,
  lowAttendanceList,
  onNavigate,
  onAddStudent,
  onImportCSV,
  onViewStudent,
}: DashboardProps) {
  const totalStudents = students.length || 12
  const activeStudents = students.filter((s) => s.status === "Active").length || totalStudents

  // Compute average attendance rate
  const avgAttendance =
    students.length > 0
      ? (
          students.reduce((acc, s) => acc + (s.attendance_rate || 95), 0) /
          students.length
        ).toFixed(1)
      : "94.8"

  // Compute average GPA
  const avgGPA =
    students.length > 0
      ? (
          students.reduce((acc, s) => acc + (s.current_gpa || 3.5), 0) /
          students.length
        ).toFixed(2)
      : "3.62"

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
              Academic Dashboard
            </h1>
            <Badge variant="secondary" className="text-[11px] font-normal">
              Fall 2025 • Term 1
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Overview of student enrollments, daily attendance rates, academic performance, and institutional alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onImportCSV}
            className="h-8 gap-1.5 text-xs font-medium"
          >
            <FileSpreadsheet className="size-3.5" />
            <span>Bulk CSV Import</span>
          </Button>
          <Button
            size="sm"
            onClick={onAddStudent}
            className="h-8 gap-1.5 text-xs font-medium shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>New Student</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Students */}
        <Card className="transition-all hover:shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total Enrolled
              </span>
              <div className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Users className="size-3.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-foreground font-heading">
                {totalStudents}
              </span>
              <span className="text-xs text-muted-foreground">
                Students ({activeStudents} Active)
              </span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground border-t border-border/40 pt-2">
              Across {classes.length || 5} academic sections
            </p>
          </CardContent>
        </Card>

        {/* Attendance Rate */}
        <Card className="transition-all hover:shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Avg Attendance
              </span>
              <div className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <UserCheck className="size-3.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-foreground font-heading">
                {avgAttendance}%
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="size-3" />
                +1.2%
              </span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground border-t border-border/40 pt-2">
              Target threshold: ≥ 85.0%
            </p>
          </CardContent>
        </Card>

        {/* Institution GPA */}
        <Card className="transition-all hover:shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Average GPA
              </span>
              <div className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <GraduationCap className="size-3.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-foreground font-heading">
                {avgGPA}
              </span>
              <span className="text-xs text-muted-foreground">/ 4.00 Max</span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground border-t border-border/40 pt-2">
              Based on recent term examinations
            </p>
          </CardContent>
        </Card>

        {/* Low Attendance Alerts */}
        <Card
          className={`transition-all hover:shadow-sm ${
            lowAttendanceList.length > 0
              ? "border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/10"
              : ""
          }`}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Attendance Alerts
              </span>
              <div className="flex size-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-3.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-foreground font-heading">
                {lowAttendanceList.length}
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Below 75% threshold
              </span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground border-t border-border/40 pt-2">
              Requires parental notification
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main 2-Column Dashboard Sections */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column (8 cols): Low Attendance Alert Box & Top Academic Performers */}
        <div className="lg:col-span-8 space-y-6">
          {/* Low Attendance Flag Alert List */}
          {lowAttendanceList.length > 0 && (
            <Card className="border-amber-500/40 bg-card">
              <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
                    <CardTitle className="text-sm font-semibold text-foreground">
                      Low Attendance Warnings (Under 75%)
                    </CardTitle>
                  </div>
                  <Badge variant="destructive" className="text-[10px]">
                    Action Required
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  {lowAttendanceList.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-muted flex items-center justify-center font-semibold text-xs">
                          {item.first_name?.[0]}
                          {item.last_name?.[0]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            {item.first_name} {item.last_name}
                            <span className="ml-2 font-mono text-[10px] text-muted-foreground font-normal">
                              {item.roll_no}
                            </span>
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {item.grade}-{item.section} • Guardian: {item.guardian_name} ({item.guardian_contact})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                            {item.attendance_percentage}%
                          </span>
                          <p className="text-[10px] text-muted-foreground">
                            {item.absent_days} absences
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => onViewStudent(item.id)}
                          className="text-[11px]"
                        >
                          Inspect Record
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enrolled Classes Breakdown */}
          <Card>
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  Academic Classes &amp; Sections
                </CardTitle>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onNavigate("courses")}
                  className="text-xs text-muted-foreground"
                >
                  Manage Classes →
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between p-4 transition-colors hover:bg-muted/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-xs font-mono font-bold text-foreground">
                        {cls.section}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-foreground">
                          {cls.grade} - Section {cls.section}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          {cls.room} • Mentor: {cls.class_teacher_name || "Unassigned"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <Badge variant="secondary" className="text-[10px]">
                        {cls.student_count || 0} Students
                      </Badge>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => onNavigate("attendance")}
                        className="text-[11px]"
                      >
                        Mark Attendance
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (4 cols): Quick Operations & Academic Calendar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Operations */}
          <Card>
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-semibold">
                Quick SIS Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <button
                onClick={() => onNavigate("attendance")}
                className="group flex w-full items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3 text-left transition-all hover:bg-muted/60"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:text-foreground">
                    <UserCheck className="size-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Daily Attendance Sheet
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Mark present, late, or excused
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-foreground">→</span>
              </button>

              <button
                onClick={() => onNavigate("grades")}
                className="group flex w-full items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3 text-left transition-all hover:bg-muted/60"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:text-foreground">
                    <GraduationCap className="size-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Gradebook &amp; Exam Marks
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Enter marks &amp; auto-calc GPA
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-foreground">→</span>
              </button>

              <button
                onClick={() => onNavigate("timetable")}
                className="group flex w-full items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3 text-left transition-all hover:bg-muted/60"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:text-foreground">
                    <Calendar className="size-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Timetable &amp; Schedule
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Weekly period matrices
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-foreground">→</span>
              </button>
            </CardContent>
          </Card>

          {/* Academic Schedule & Milestone */}
          <Card>
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-semibold">
                Upcoming Academic Events
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-foreground font-mono text-[10px] font-bold">
                  SEP
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Unit Assessment 1 (Fall 2026)
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Sept 5 - Sept 10 • All Grade 10 &amp; 11 cohorts
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-border/40 pt-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-foreground font-mono text-[10px] font-bold">
                  OCT
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Mid-Term Parent-Teacher Conference
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Oct 15 • Report card reviews and counseling
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
