"use client"

import React, { useEffect, useState } from "react"
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Layers,
  Plus,
  School,
  UserCheck,
  Users,
  X,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface CoursesViewProps {
  classes: any[]
  onRefresh: () => void
}

export function CoursesView({ classes, onRefresh }: CoursesViewProps) {
  const [subjects, setSubjects] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("cls-10a")

  const [isAddClassOpen, setIsAddClassOpen] = useState(false)
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false)
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const loadData = () => {
    fetch("/api/subjects")
      .then((r) => r.json())
      .then((d) => d.success && setSubjects(d.subjects))

    fetch(`/api/class-subjects?classId=${selectedClass}`)
      .then((r) => r.json())
      .then((d) => d.success && setAssignments(d.assignments))
  }

  useEffect(() => {
    loadData()
  }, [selectedClass])

  // Handle Add Class
  const handleAddClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload = {
      grade: form.get("grade"),
      section: form.get("section"),
      room: form.get("room"),
      academic_year: "2025-2026",
    }
    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (data.success) {
      setFeedback("Class section created successfully!")
      setTimeout(() => setFeedback(null), 3000)
      setIsAddClassOpen(false)
      onRefresh()
    }
  }

  // Handle Add Subject
  const handleAddSubject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload = {
      code: form.get("code"),
      name: form.get("name"),
      department: form.get("department"),
      credits: Number(form.get("credits") || 3),
      description: form.get("description"),
    }
    const res = await fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (data.success) {
      setFeedback("Subject created successfully!")
      setTimeout(() => setFeedback(null), 3000)
      setIsAddSubjectOpen(false)
      loadData()
    }
  }

  // Handle Assign Teacher
  const handleAssignTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload = {
      class_id: selectedClass,
      subject_id: form.get("subject_id"),
      teacher_id: form.get("teacher_id"),
      periods_per_week: Number(form.get("periods_per_week") || 4),
    }
    const res = await fetch("/api/class-subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (data.success) {
      setFeedback("Teacher assigned to subject!")
      setTimeout(() => setFeedback(null), 3000)
      setIsAssignOpen(false)
      loadData()
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
            Academic Courses &amp; Class Allocations
          </h2>
          <p className="text-xs text-muted-foreground">
            Configure subjects, faculty allocations, and section assignments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddClassOpen(true)}
            className="h-8 text-xs font-medium gap-1"
          >
            <Plus className="size-3.5" />
            <span>Add Class</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAddSubjectOpen(true)}
            className="h-8 text-xs font-medium gap-1 shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>Add Subject</span>
          </Button>
        </div>
      </div>

      {/* Section 1: Subject Catalog */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Subject Catalog ({subjects.length})
            </CardTitle>
            <Badge variant="secondary" className="text-[10px]">
              Institutional Curriculum
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground font-medium border-b border-border/50">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Subject Name</th>
                <th className="p-3">Department</th>
                <th className="p-3 text-center">Credits</th>
                <th className="p-3">Curriculum Focus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {subjects.map((sub) => (
                <tr key={sub.id} className="hover:bg-muted/20">
                  <td className="p-3 font-mono font-bold text-foreground">
                    {sub.code}
                  </td>
                  <td className="p-3 font-semibold text-foreground">
                    {sub.name}
                  </td>
                  <td className="p-3">
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground font-medium">
                      {sub.department}
                    </span>
                  </td>
                  <td className="p-3 text-center font-semibold text-foreground">
                    {sub.credits} Credits
                  </td>
                  <td className="p-3 text-muted-foreground text-[11px]">
                    {sub.description || "Core foundational curriculum"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Section 2: Teacher-Course Allocations */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">
              Select Class:
            </span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="h-8 rounded-lg border border-input bg-transparent px-3 text-xs text-foreground outline-none font-medium"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.grade} - Section {c.section} ({c.room})
                </option>
              ))}
            </select>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAssignOpen(true)}
            className="h-8 text-xs gap-1.5 self-start sm:self-auto"
          >
            <Plus className="size-3.5" />
            <span>Assign Faculty to Course</span>
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-sm font-semibold">
              Assigned Faculty &amp; Teaching Load for Selected Class
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground font-medium border-b border-border/50">
                <tr>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Assigned Faculty Member</th>
                  <th className="p-3 text-center">Periods / Wk</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {assignments.length > 0 ? (
                  assignments.map((asg) => (
                    <tr key={asg.id} className="hover:bg-muted/20">
                      <td className="p-3 font-semibold text-foreground">
                        {asg.subject_name}
                        <span className="block font-mono text-[10px] text-muted-foreground font-normal">
                          {asg.subject_code} ({asg.credits} credits)
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {asg.department}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                            {asg.teacher_name?.[0] || "T"}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-[11px]">
                              {asg.teacher_name}
                            </p>
                            <p className="text-[9px] text-muted-foreground">
                              {asg.teacher_email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center font-bold text-foreground">
                        {asg.periods_per_week || 4}
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                          Active Allocation
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-muted-foreground text-xs">
                      No faculty assigned to this section yet. Click &ldquo;Assign Faculty to Course&rdquo; above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Modal: Add Class */}
      {isAddClassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <button
              onClick={() => setIsAddClassOpen(false)}
              className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
            <h3 className="text-base font-bold text-foreground font-heading">
              Create New Academic Class Section
            </h3>
            <form onSubmit={handleAddClass} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-medium text-foreground">Grade Level</label>
                <Input name="grade" defaultValue="Grade 11" placeholder="e.g. Grade 11" required />
              </div>
              <div>
                <label className="font-medium text-foreground">Section</label>
                <Input name="section" defaultValue="C" placeholder="e.g. C" required />
              </div>
              <div>
                <label className="font-medium text-foreground">Assigned Room</label>
                <Input name="room" defaultValue="Room 408" placeholder="e.g. Room 408" required />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddClassOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Create Section
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Subject */}
      {isAddSubjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <button
              onClick={() => setIsAddSubjectOpen(false)}
              className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
            <h3 className="text-base font-bold text-foreground font-heading">
              Register New Course Subject
            </h3>
            <form onSubmit={handleAddSubject} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-medium text-foreground">Subject Code</label>
                <Input name="code" defaultValue="BIO-101" placeholder="e.g. BIO-101" required />
              </div>
              <div>
                <label className="font-medium text-foreground">Subject Title</label>
                <Input name="name" defaultValue="Advanced Molecular Biology" placeholder="e.g. Molecular Biology" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-foreground">Department</label>
                  <Input name="department" defaultValue="Sciences" placeholder="Sciences" required />
                </div>
                <div>
                  <label className="font-medium text-foreground">Credits</label>
                  <Input name="credits" type="number" defaultValue={4} required />
                </div>
              </div>
              <div>
                <label className="font-medium text-foreground">Description</label>
                <Input name="description" defaultValue="Cellular structure, genetics, and biotechnology laboratory techniques" placeholder="Course syllabus overview..." />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddSubjectOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Subject
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Faculty */}
      {isAssignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <button
              onClick={() => setIsAssignOpen(false)}
              className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
            <h3 className="text-base font-bold text-foreground font-heading">
              Assign Faculty Member
            </h3>
            <form onSubmit={handleAssignTeacher} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-medium text-foreground">Select Subject</label>
                <select
                  name="subject_id"
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-xs text-foreground outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-foreground">Select Teacher</label>
                <select
                  name="teacher_id"
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-xs text-foreground outline-none"
                >
                  <option value="usr-tea-1">Dr. Marcus Vance (Mathematics)</option>
                  <option value="usr-tea-2">Sarah Jenkins (Sciences)</option>
                  <option value="usr-tea-3">David Rossi (Computer Science)</option>
                  <option value="usr-tea-4">Claire Dubois (Literature)</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-foreground">Periods Per Week</label>
                <Input name="periods_per_week" type="number" defaultValue={4} />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAssignOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Assign Faculty
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
