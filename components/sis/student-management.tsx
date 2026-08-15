"use client"

import React, { useState } from "react"
import {
  AlertTriangle,
  Download,
  Edit2,
  Eye,
  FileSpreadsheet,
  Filter,
  MoreVertical,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  UserCheck,
  Users,
  X,
} from "lucide-react"
import Papa from "papaparse"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const DUMMY_STUDENT_PRESETS = [
  {
    first_name: "Ramesh",
    last_name: "Sharma",
    roll_no: "STU-2025-015",
    dob: "2009-04-15",
    gender: "Male",
    class_id: "cls-10a",
    email: "ramesh.sharma@student.newtonsis.edu",
    contact: "+91 98765 43210",
    address: "B-104 Sunrise Heights, Mumbai",
    guardian_name: "Sanjay Sharma",
    guardian_contact: "+91 98765 43211",
    guardian_email: "sanjay.sharma@family.com",
    status: "Active",
  },
  {
    first_name: "Suresh",
    last_name: "Verma",
    roll_no: "STU-2025-016",
    dob: "2009-08-22",
    gender: "Male",
    class_id: "cls-10a",
    email: "suresh.verma@student.newtonsis.edu",
    contact: "+91 98765 43212",
    address: "Flat 402 Green Valley, Pune",
    guardian_name: "Ramesh Verma",
    guardian_contact: "+91 98765 43213",
    guardian_email: "r.verma@gmail.com",
    status: "Active",
  },
  {
    first_name: "Nikita",
    last_name: "Patel",
    roll_no: "STU-2025-017",
    dob: "2009-01-10",
    gender: "Female",
    class_id: "cls-10a",
    email: "nikita.patel@student.newtonsis.edu",
    contact: "+91 98765 43214",
    address: "Plot 12 Sector 15, Ahmedabad",
    guardian_name: "Mukesh Patel",
    guardian_contact: "+91 98765 43215",
    guardian_email: "mpatel@techcorp.com",
    status: "Active",
  },
  {
    first_name: "Reeta",
    last_name: "Gupta",
    roll_no: "STU-2025-018",
    dob: "2009-11-05",
    gender: "Female",
    class_id: "cls-10a",
    email: "reeta.gupta@student.newtonsis.edu",
    contact: "+91 98765 43216",
    address: "C-88 Indirapuram, Delhi",
    guardian_name: "Alok Gupta",
    guardian_contact: "+91 98765 43217",
    guardian_email: "alok.gupta@medorg.in",
    status: "Active",
  },
  {
    first_name: "Vaibhav",
    last_name: "Joshi",
    roll_no: "STU-2025-019",
    dob: "2009-03-30",
    gender: "Male",
    class_id: "cls-10a",
    email: "vaibhav.joshi@student.newtonsis.edu",
    contact: "+91 98765 43218",
    address: "72 Tilak Nagar, Jaipur",
    guardian_name: "Prakash Joshi",
    guardian_contact: "+91 98765 43219",
    guardian_email: "prakash.joshi@gov.in",
    status: "Active",
  },
]

interface StudentManagementProps {
  students: any[]
  classes: any[]
  onRefresh: () => void
  onViewProfile: (studentId: string) => void
  isAddModalOpen: boolean
  setIsAddModalOpen: (open: boolean) => void
  isImportModalOpen: boolean
  setIsImportModalOpen: (open: boolean) => void
}

export function StudentManagement({
  students,
  classes,
  onRefresh,
  onViewProfile,
  isAddModalOpen,
  setIsAddModalOpen,
  isImportModalOpen,
  setIsImportModalOpen,
}: StudentManagementProps) {
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [editingStudent, setEditingStudent] = useState<any | null>(null)
  const [importText, setImportText] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [presetIndex, setPresetIndex] = useState(0)
  const currentPreset = DUMMY_STUDENT_PRESETS[presetIndex]

  const handleNextPreset = () => {
    setPresetIndex((prev) => (prev + 1) % DUMMY_STUDENT_PRESETS.length)
  }

  // Filter students
  const filteredStudents = students.filter((s) => {
    if (selectedClass !== "all" && s.class_id !== selectedClass) return false
    if (selectedStatus !== "all" && s.status !== selectedStatus) return false
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase()
      const match =
        s.first_name.toLowerCase().includes(q) ||
        s.last_name.toLowerCase().includes(q) ||
        s.roll_no.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.guardian_name?.toLowerCase().includes(q)
      if (!match) return false
    }
    return true
  })

  // Handle Delete Student
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete student "${name}"?`)) return
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        setFeedback(`Student ${name} deleted.`)
        setTimeout(() => setFeedback(null), 3000)
        onRefresh()
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Handle Form Submit (Add / Edit)
  const handleSaveStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const payload = {
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      roll_no: formData.get("roll_no"),
      email: formData.get("email"),
      dob: formData.get("dob"),
      gender: formData.get("gender"),
      contact: formData.get("contact"),
      address: formData.get("address"),
      class_id: formData.get("class_id"),
      guardian_name: formData.get("guardian_name"),
      guardian_contact: formData.get("guardian_contact"),
      guardian_email: formData.get("guardian_email"),
      status: formData.get("status"),
      photo_url: formData.get("photo_url"),
    }

    try {
      const url = editingStudent ? `/api/students/${editingStudent.id}` : "/api/students"
      const method = editingStudent ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback(
          editingStudent ? "Student updated successfully!" : "Student registered successfully!"
        )
        setTimeout(() => setFeedback(null), 3000)
        setIsAddModalOpen(false)
        setEditingStudent(null)
        onRefresh()
      } else {
        alert(data.error || "Failed to save student")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Bulk Import
  const handleBulkImport = async () => {
    if (!importText.trim()) return
    setIsSubmitting(true)
    try {
      const parsed = Papa.parse(importText, { header: true, skipEmptyLines: true })
      if (parsed.data && parsed.data.length > 0) {
        const res = await fetch("/api/students/bulk-import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ students: parsed.data }),
        })
        const data = await res.json()
        if (data.success) {
          setFeedback(data.message)
          setTimeout(() => setFeedback(null), 4000)
          setIsImportModalOpen(false)
          setImportText("")
          onRefresh()
        } else {
          alert(data.error || "Failed to import students")
        }
      }
    } catch (err) {
      console.error(err)
      alert("Error parsing CSV data")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Sample CSV template generator
  const loadSampleCSV = () => {
    const sample = `roll_no,first_name,last_name,dob,gender,class_id,contact,address,guardian_name,guardian_contact,status
STU-2025-101,Ramesh,Sharma,2009-04-15,Male,cls-10a,+91 98765 11001,B-104 Sunrise Heights Mumbai,Sanjay Sharma,+91 98765 11002,Active
STU-2025-102,Suresh,Verma,2009-08-22,Male,cls-10a,+91 98765 22001,Flat 402 Green Valley Pune,Ramesh Verma,+91 98765 22002,Active
STU-2025-103,Nikita,Patel,2009-01-10,Female,cls-10a,+91 98765 33001,Plot 12 Sector 15 Ahmedabad,Mukesh Patel,+91 98765 33002,Active
STU-2025-104,Reeta,Gupta,2009-11-05,Female,cls-10a,+91 98765 44001,C-88 Indirapuram Delhi,Alok Gupta,+91 98765 44002,Active
STU-2025-105,Vaibhav,Joshi,2009-03-30,Male,cls-10a,+91 98765 55001,72 Tilak Nagar Jaipur,Prakash Joshi,+91 98765 55002,Active`
    setImportText(sample)
  }

  // Export CSV
  const handleExportCSV = () => {
    const csv = Papa.unparse(filteredStudents)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `students_export_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-in fade-in">
          {feedback}
        </div>
      )}

      {/* Header Controls & Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground font-heading">
            Student Directory
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage student registrations, academic standing, and guardian profiles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-8 gap-1.5 text-xs font-medium"
          >
            <Download className="size-3.5" />
            <span>Export CSV</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            className="h-8 gap-1.5 text-xs font-medium"
          >
            <Upload className="size-3.5" />
            <span>Import CSV</span>
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditingStudent(null)
              setIsAddModalOpen(true)
            }}
            className="h-8 gap-1.5 text-xs font-medium shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>Add Student</span>
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-border/70 bg-card p-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, roll no, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8.5 text-xs"
          />
        </div>

        {/* Class Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Class:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-xs text-foreground outline-none focus:border-ring"
          >
            <option value="all">All Classes ({classes.length})</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.grade} - {c.section}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-xs text-foreground outline-none focus:border-ring"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
            <option value="Alumni">Alumni</option>
          </select>
        </div>
      </div>

      {/* Student Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground font-medium border-b border-border/50">
              <tr>
                <th className="p-3.5">Student</th>
                <th className="p-3.5">Roll No</th>
                <th className="p-3.5">Class / Room</th>
                <th className="p-3.5 text-center">Attendance</th>
                <th className="p-3.5 text-center">Term GPA</th>
                <th className="p-3.5">Guardian Details</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => onViewProfile(s.id)}
                  >
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8 ring-1 ring-border">
                          <AvatarImage src={s.photo_url} alt={s.first_name} />
                          <AvatarFallback className="text-xs font-semibold">
                            {s.first_name?.[0]}
                            {s.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">
                            {s.first_name} {s.last_name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {s.email || `${s.first_name.toLowerCase()}@student.newtonsis.edu`}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-[11px] text-muted-foreground">
                      {s.roll_no}
                    </td>

                    <td className="p-3.5">
                      <span className="font-medium text-foreground">
                        {s.grade} - {s.section}
                      </span>
                      <span className="block text-[10px] text-muted-foreground">
                        {s.room}
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          (s.attendance_rate || 95) < 75
                            ? "text-rose-600 dark:text-rose-400"
                            : (s.attendance_rate || 95) < 85
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {(s.attendance_rate || 95) < 75 && (
                          <AlertTriangle className="size-3 text-rose-500" />
                        )}
                        {s.attendance_rate || 95}%
                      </span>
                    </td>

                    <td className="p-3.5 text-center font-bold text-foreground">
                      {s.current_gpa || "3.60"}
                    </td>

                    <td className="p-3.5">
                      <p className="text-foreground font-medium text-[11px]">
                        {s.guardian_name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {s.guardian_contact}
                      </p>
                    </td>

                    <td className="p-3.5 text-center">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          s.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>

                    <td
                      className="p-3.5 text-right space-x-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onViewProfile(s.id)}
                        title="View Profile"
                      >
                        <Eye className="size-3.5 text-muted-foreground hover:text-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => {
                          setEditingStudent(s)
                          setIsAddModalOpen(true)
                        }}
                        title="Edit Student"
                      >
                        <Edit2 className="size-3.5 text-muted-foreground hover:text-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDelete(s.id, `${s.first_name} ${s.last_name}`)}
                        title="Delete Student"
                      >
                        <Trash2 className="size-3.5 text-destructive hover:text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground text-xs">
                    No students match your filter parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl rounded-xl border border-border bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsAddModalOpen(false)
                setEditingStudent(null)
              }}
              className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-foreground font-heading">
                  {editingStudent ? "Edit Student Record" : "Register New Student"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Enter academic registration details and guardian contact information.
                </p>
              </div>

              {!editingStudent && (
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={handleNextPreset}
                  className="gap-1 text-[11px] font-medium text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 mr-6"
                >
                  <Sparkles className="size-3" />
                  <span>Autofill Sample ({currentPreset.first_name})</span>
                </Button>
              )}
            </div>

            <form key={editingStudent ? editingStudent.id : `preset-${presetIndex}`} onSubmit={handleSaveStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-foreground">First Name *</label>
                  <Input
                    name="first_name"
                    defaultValue={editingStudent?.first_name || currentPreset.first_name}
                    required
                    placeholder="Ramesh"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Last Name *</label>
                  <Input
                    name="last_name"
                    defaultValue={editingStudent?.last_name || currentPreset.last_name}
                    required
                    placeholder="Sharma"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Roll Number *</label>
                  <Input
                    name="roll_no"
                    defaultValue={
                      editingStudent?.roll_no || currentPreset.roll_no
                    }
                    required
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Date of Birth *</label>
                  <Input
                    type="date"
                    name="dob"
                    defaultValue={editingStudent?.dob || currentPreset.dob}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Gender *</label>
                  <select
                    name="gender"
                    defaultValue={editingStudent?.gender || currentPreset.gender}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-xs text-foreground outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Assigned Class *</label>
                  <select
                    name="class_id"
                    defaultValue={editingStudent?.class_id || currentPreset.class_id || classes[0]?.id || "cls-10a"}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-xs text-foreground outline-none"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.grade} - {c.section} ({c.room})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Enrollment Status</label>
                  <select
                    name="status"
                    defaultValue={editingStudent?.status || currentPreset.status}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-xs text-foreground outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Alumni">Alumni</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Student Email</label>
                  <Input
                    type="email"
                    name="email"
                    defaultValue={editingStudent?.email || currentPreset.email}
                    placeholder="student@school.edu"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Student Phone</label>
                  <Input
                    name="contact"
                    defaultValue={editingStudent?.contact || currentPreset.contact}
                    placeholder="+91 98765 00000"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Residential Address</label>
                <Input
                  name="address"
                  defaultValue={editingStudent?.address || currentPreset.address}
                  placeholder="Street, City, State"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-border/40 pt-3">
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Guardian Name *</label>
                  <Input
                    name="guardian_name"
                    defaultValue={editingStudent?.guardian_name || currentPreset.guardian_name}
                    required
                    placeholder="Parent / Guardian"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Guardian Phone *</label>
                  <Input
                    name="guardian_contact"
                    defaultValue={editingStudent?.guardian_contact || currentPreset.guardian_contact}
                    required
                    placeholder="+91 98765 00000"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Guardian Email</label>
                <Input
                  type="email"
                  name="guardian_email"
                  defaultValue={editingStudent?.guardian_email || currentPreset.guardian_email}
                  placeholder="parent@email.com"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddModalOpen(false)
                    setEditingStudent(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : editingStudent ? "Update Record" : "Register Student"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl rounded-xl border border-border bg-card p-6 shadow-xl">
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-2">
              <FileSpreadsheet className="size-5 text-foreground" />
              <h2 className="text-base font-bold text-foreground font-heading">
                Bulk Student CSV Import
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Paste comma-separated student rows or load the pre-formatted template.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">
                  CSV Data Rows
                </span>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={loadSampleCSV}
                  className="text-xs text-primary underline"
                >
                  Load Sample Template
                </Button>
              </div>

              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="roll_no,first_name,last_name,dob,gender,class_id,contact,address,guardian_name,guardian_contact,status..."
                rows={8}
                className="w-full rounded-lg border border-input bg-muted/20 p-3 font-mono text-[11px] leading-relaxed text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsImportModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleBulkImport}
                  disabled={isSubmitting || !importText.trim()}
                >
                  {isSubmitting ? "Importing..." : "Process & Import Rows"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
