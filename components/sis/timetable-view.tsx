"use client"

import React, { useEffect, useState } from "react"
import {
  Calendar,
  Clock,
  Edit2,
  MapPin,
  Plus,
  User,
  X,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface TimetableProps {
  classes: any[]
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const PERIODS = [1, 2, 3, 4, 5, 6]

export function TimetableView({ classes }: TimetableProps) {
  const [selectedClass, setSelectedClass] = useState<string>("cls-10a")
  const [timetable, setTimetable] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [editingSlot, setEditingSlot] = useState<any | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const loadTimetable = () => {
    fetch(`/api/timetable?classId=${selectedClass}`)
      .then((r) => r.json())
      .then((d) => d.success && setTimetable(d.timetable))

    fetch("/api/subjects")
      .then((r) => r.json())
      .then((d) => d.success && setSubjects(d.subjects))
  }

  useEffect(() => {
    loadTimetable()
  }, [selectedClass])

  const getSlot = (day: string, periodNum: number) => {
    return timetable.find(
      (t) => t.day_of_week === day && t.period_number === periodNum
    )
  }

  const handleSaveSlot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload = {
      id: editingSlot?.id,
      class_id: selectedClass,
      day_of_week: editingSlot.day_of_week,
      period_number: editingSlot.period_number,
      start_time: form.get("start_time"),
      end_time: form.get("end_time"),
      subject_id: form.get("subject_id"),
      teacher_id: form.get("teacher_id"),
      room: form.get("room"),
    }

    const res = await fetch("/api/timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (data.success) {
      setFeedback("Schedule slot updated successfully!")
      setTimeout(() => setFeedback(null), 3000)
      setEditingSlot(null)
      loadTimetable()
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
            Class Timetable &amp; Schedule Matrix
          </h2>
          <p className="text-xs text-muted-foreground">
            Weekly period allocations, classrooms, and assigned instructor schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">Active Class:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="h-8 rounded-lg border border-input bg-transparent px-3 text-xs font-semibold text-foreground outline-none"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.grade} - Section {c.section} ({c.room})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timetable Weekly Matrix Grid */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs min-w-[720px]">
            <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border/60">
              <tr>
                <th className="p-3 w-28 border-r border-border/50 text-center">
                  Period / Day
                </th>
                {DAYS.map((day) => (
                  <th key={day} className="p-3 text-center border-r border-border/50">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {PERIODS.map((pNum) => (
                <tr key={pNum}>
                  <td className="p-3 bg-muted/20 font-mono text-center font-bold text-foreground border-r border-border/50">
                    Period {pNum}
                  </td>
                  {DAYS.map((day) => {
                    const slot = getSlot(day, pNum)
                    return (
                      <td
                        key={day}
                        className="p-2.5 border-r border-border/40 align-top transition-colors hover:bg-muted/20"
                      >
                        {slot ? (
                          <div
                            onClick={() => setEditingSlot(slot)}
                            className="group relative cursor-pointer rounded-lg border border-border/60 bg-muted/40 p-2 transition-all hover:border-primary/50 hover:bg-muted/80"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-foreground text-[11px] truncate">
                                {slot.subject_name}
                              </span>
                              <Edit2 className="size-2.5 opacity-0 group-hover:opacity-100 text-muted-foreground" />
                            </div>
                            <div className="mt-1 space-y-0.5 text-[10px] text-muted-foreground">
                              <p className="flex items-center gap-1 font-mono text-[9px]">
                                <Clock className="size-2.5" />
                                {slot.start_time} - {slot.end_time}
                              </p>
                              <p className="flex items-center gap-1 truncate">
                                <User className="size-2.5" />
                                {slot.teacher_name}
                              </p>
                              <p className="flex items-center gap-1 font-mono text-[9px] text-foreground">
                                <MapPin className="size-2.5" />
                                {slot.room}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              setEditingSlot({
                                class_id: selectedClass,
                                day_of_week: day,
                                period_number: pNum,
                                start_time: "09:00",
                                end_time: "09:50",
                                subject_id: subjects[0]?.id || "sub-math10",
                                teacher_id: "usr-tea-1",
                                room: "Room 302",
                              })
                            }
                            className="flex h-16 w-full items-center justify-center rounded-lg border border-dashed border-border/60 text-[10px] text-muted-foreground hover:border-border hover:bg-muted/30 transition-all"
                          >
                            + Slot
                          </button>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Edit Period Slot Modal */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <button
              onClick={() => setEditingSlot(null)}
              className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
            <h3 className="text-base font-bold text-foreground font-heading">
              Edit Period {editingSlot.period_number} — {editingSlot.day_of_week}
            </h3>

            <form onSubmit={handleSaveSlot} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-medium text-foreground">Subject</label>
                <select
                  name="subject_id"
                  defaultValue={editingSlot.subject_id}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-xs text-foreground outline-none font-medium"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-foreground">Instructor</label>
                <select
                  name="teacher_id"
                  defaultValue={editingSlot.teacher_id}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-xs text-foreground outline-none font-medium"
                >
                  <option value="usr-tea-1">Dr. Marcus Vance (Mathematics)</option>
                  <option value="usr-tea-2">Sarah Jenkins (Sciences)</option>
                  <option value="usr-tea-3">David Rossi (Computer Science)</option>
                  <option value="usr-tea-4">Claire Dubois (Literature)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-foreground">Start Time</label>
                  <Input
                    name="start_time"
                    defaultValue={editingSlot.start_time || "08:30"}
                    required
                  />
                </div>
                <div>
                  <label className="font-medium text-foreground">End Time</label>
                  <Input
                    name="end_time"
                    defaultValue={editingSlot.end_time || "09:20"}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-foreground">Classroom / Lab</label>
                <Input
                  name="room"
                  defaultValue={editingSlot.room || "Room 302"}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingSlot(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Period Slot
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
