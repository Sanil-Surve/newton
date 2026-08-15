"use client"

import React, { useEffect, useState } from "react"
import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  Save,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AttendanceViewProps {
  classes: any[]
  onRefresh: () => void
}

type AttendanceStatus = "Present" | "Absent" | "Late" | "Excused"

export function AttendanceView({ classes, onRefresh }: AttendanceViewProps) {
  const [selectedClass, setSelectedClass] = useState<string>("cls-10a")
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [lowAttendanceList, setLowAttendanceList] = useState<any[]>([])

  const loadAttendance = () => {
    setLoading(true)
    fetch(`/api/attendance?classId=${selectedClass}&date=${selectedDate}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setRecords(d.records)
        }
      })
      .finally(() => setLoading(false))

    fetch(`/api/attendance/summary?classId=${selectedClass}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setLowAttendanceList(d.lowAttendanceStudents || [])
        }
      })
  }

  useEffect(() => {
    loadAttendance()
  }, [selectedClass, selectedDate])

  const setStatusForStudent = (studentId: string, status: AttendanceStatus) => {
    setRecords((prev) =>
      prev.map((r) => (r.student_id === studentId ? { ...r, status } : r))
    )
  }

  const setRemarksForStudent = (studentId: string, remarks: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.student_id === studentId ? { ...r, remarks } : r))
    )
  }

  const markAll = (status: AttendanceStatus) => {
    setRecords((prev) => prev.map((r) => ({ ...r, status })))
  }

  const handleSaveAttendance = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: selectedClass,
          date: selectedDate,
          records,
          marked_by: "usr-tea-1",
        }),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback(`Attendance sheet saved for ${data.count} students!`)
        setTimeout(() => setFeedback(null), 3000)
        onRefresh()
        loadAttendance()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const presentCount = records.filter(
    (r) => r.status === "Present" || r.status === "Late"
  ).length
  const totalCount = records.length || 1
  const dailyRate = ((presentCount / totalCount) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          {feedback}
        </div>
      )}

      {/* Header & Date/Class Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground font-heading">
            Daily Attendance Marking Sheet
          </h2>
          <p className="text-xs text-muted-foreground">
            Mark daily student attendance, log excuses, and track attendance thresholds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Class selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="h-8 rounded-lg border border-input bg-transparent px-2 text-xs font-medium text-foreground outline-none"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.grade} - {c.section}
                </option>
              ))}
            </select>
          </div>

          {/* Date selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">Date:</span>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-8 w-36 text-xs font-mono"
            />
          </div>

          <Button
            size="sm"
            onClick={handleSaveAttendance}
            disabled={isSaving || records.length === 0}
            className="h-8 gap-1.5 text-xs font-medium shadow-xs"
          >
            <Save className="size-3.5" />
            <span>{isSaving ? "Saving..." : "Save Attendance"}</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 text-xs">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-muted-foreground text-[11px]">Date Session</p>
          <p className="mt-1 font-mono font-bold text-foreground text-sm">
            {selectedDate}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-muted-foreground text-[11px]">Class Present Rate</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">{dailyRate}%</span>
            <span className="text-muted-foreground text-[10px]">
              ({presentCount}/{totalCount} students)
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-[11px]">Quick Fill</p>
            <p className="font-semibold text-foreground text-xs mt-0.5">
              Batch Mark All
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="xs"
              onClick={() => markAll("Present")}
              className="text-[10px] text-emerald-600"
            >
              All Present
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => markAll("Absent")}
              className="text-[10px] text-rose-600"
            >
              All Absent
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-center justify-between">
          <div>
            <p className="text-amber-600 dark:text-amber-400 text-[11px] font-semibold">
              Low Attendance Flags
            </p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {lowAttendanceList.length} Students &lt; 75%
            </p>
          </div>
          <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
        </div>
      </div>

      {/* Attendance Roster Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Student Attendance Roster
            </CardTitle>
            <span className="text-[11px] text-muted-foreground">
              {records.length} Students listed
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-muted/60 text-muted-foreground font-medium border-b border-border/50">
              <tr>
                <th className="p-3">Roll No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3 text-center">Attendance Status</th>
                <th className="p-3">Remarks / Excuse Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {records.length > 0 ? (
                records.map((rec) => (
                  <tr key={rec.student_id} className="hover:bg-muted/20">
                    <td className="p-3 font-mono font-semibold text-muted-foreground">
                      {rec.roll_no}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-7 ring-1 ring-border">
                          <AvatarImage src={rec.photo_url} alt={rec.first_name} />
                          <AvatarFallback className="text-[10px] font-bold">
                            {rec.first_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-foreground">
                          {rec.first_name} {rec.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1 rounded-lg border border-border/60 p-0.5 bg-muted/20">
                        {(
                          ["Present", "Late", "Absent", "Excused"] as AttendanceStatus[]
                        ).map((st) => {
                          const isSelected = rec.status === st
                          return (
                            <button
                              key={st}
                              onClick={() => setStatusForStudent(rec.student_id, st)}
                              className={`rounded-md px-2 py-1 text-[10px] font-semibold transition-all ${
                                isSelected
                                  ? st === "Present"
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : st === "Absent"
                                    ? "bg-rose-600 text-white shadow-xs"
                                    : st === "Late"
                                    ? "bg-amber-600 text-white shadow-xs"
                                    : "bg-sky-600 text-white shadow-xs"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {st}
                            </button>
                          )
                        })}
                      </div>
                    </td>
                    <td className="p-3">
                      <Input
                        type="text"
                        value={rec.remarks || ""}
                        onChange={(e) =>
                          setRemarksForStudent(rec.student_id, e.target.value)
                        }
                        placeholder="Optional remarks (e.g. medical reason, late bus)..."
                        className="h-7 text-xs"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground text-xs">
                    No student records found for this class.
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
