"use client"

import React, { useEffect, useState } from "react"
import { SISHeader, UserRole } from "@/components/sis/header"
import { DashboardView } from "@/components/sis/dashboard-view"
import { StudentManagement } from "@/components/sis/student-management"
import { CoursesView } from "@/components/sis/courses-view"
import { TimetableView } from "@/components/sis/timetable-view"
import { AttendanceView } from "@/components/sis/attendance-view"
import { GradesView } from "@/components/sis/grades-view"
import { StudentProfileModal } from "@/components/sis/student-profile-modal"
import { ReportCardModal } from "@/components/sis/report-card-modal"
import { StudentPortal } from "@/components/sis/student-portal"
import { ParentPortal } from "@/components/sis/parent-portal"

export default function Home() {
  const [currentRole, setCurrentRole] = useState<UserRole>("admin")
  const [activeTab, setActiveTab] = useState<string>("dashboard")
  const [globalSearch, setGlobalSearch] = useState<string>("")

  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [lowAttendanceList, setLowAttendanceList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modals state
  const [viewProfileStudentId, setViewProfileStudentId] = useState<string | null>(null)
  const [reportCardStudentId, setReportCardStudentId] = useState<string | null>(null)
  const [reportCardExamId, setReportCardExamId] = useState<string>("exam-fin-2025")
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [isImportCSVOpen, setIsImportCSVOpen] = useState(false)

  // Load initial data from SQLite APIs
  const loadData = () => {
    setLoading(true)
    Promise.all([
      fetch("/api/students").then((r) => r.json()),
      fetch("/api/classes").then((r) => r.json()),
      fetch("/api/attendance/summary").then((r) => r.json()),
    ])
      .then(([studentsRes, classesRes, attRes]) => {
        if (studentsRes.success) setStudents(studentsRes.students)
        if (classesRes.success) setClasses(classesRes.classes)
        if (attRes.success) setLowAttendanceList(attRes.lowAttendanceStudents || [])
      })
      .catch((err) => console.error("Error loading SIS data:", err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenReportCard = (studentId: string, examId: string = "exam-fin-2025") => {
    setReportCardStudentId(studentId)
    setReportCardExamId(examId)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-foreground selection:text-background">
      {/* Header with Navigation & Role Switcher */}
      <SISHeader
        currentRole={currentRole}
        onRoleChange={(role) => {
          setCurrentRole(role)
          if (role === "student" || role === "parent") {
            setActiveTab(role)
          } else if (activeTab === "student" || activeTab === "parent") {
            setActiveTab("dashboard")
          }
        }}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        globalSearch={globalSearch}
        onSearchChange={setGlobalSearch}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Role: Student Portal View */}
        {currentRole === "student" || activeTab === "student" ? (
          <StudentPortal onOpenReportCard={handleOpenReportCard} />
        ) : currentRole === "parent" || activeTab === "parent" ? (
          /* Role: Parent Portal View */
          <ParentPortal onOpenReportCard={handleOpenReportCard} />
        ) : (
          /* Standard Admin / Faculty Tabbed Views */
          <>
            {activeTab === "dashboard" && (
              <DashboardView
                students={students}
                classes={classes}
                lowAttendanceList={lowAttendanceList}
                onNavigate={setActiveTab}
                onAddStudent={() => setIsAddStudentOpen(true)}
                onImportCSV={() => setIsImportCSVOpen(true)}
                onViewStudent={(id) => setViewProfileStudentId(id)}
              />
            )}

            {activeTab === "students" && (
              <StudentManagement
                students={students}
                classes={classes}
                onRefresh={loadData}
                onViewProfile={(id) => setViewProfileStudentId(id)}
                isAddModalOpen={isAddStudentOpen}
                setIsAddModalOpen={setIsAddStudentOpen}
                isImportModalOpen={isImportCSVOpen}
                setIsImportModalOpen={setIsImportCSVOpen}
              />
            )}

            {activeTab === "courses" && (
              <CoursesView classes={classes} onRefresh={loadData} />
            )}

            {activeTab === "timetable" && (
              <TimetableView classes={classes} />
            )}

            {activeTab === "attendance" && (
              <AttendanceView classes={classes} onRefresh={loadData} />
            )}

            {activeTab === "grades" && (
              <GradesView
                classes={classes}
                onOpenReportCard={handleOpenReportCard}
                onRefresh={loadData}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <StudentProfileModal
        studentId={viewProfileStudentId}
        onClose={() => setViewProfileStudentId(null)}
        onOpenReportCard={handleOpenReportCard}
      />

      <ReportCardModal
        studentId={reportCardStudentId}
        examId={reportCardExamId}
        onClose={() => setReportCardStudentId(null)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-border/60 bg-muted/20 py-5 text-xs text-muted-foreground print:hidden">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              Newton SIS • Student Information System
            </span>
            <span>—</span>
            <span>SQLite Database Active</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Fall 2025 Session</span>
            <span>•</span>
            <span>Role-Based Access: Admin, Teacher, Student, Parent</span>
          </div>
        </div>
      </footer>
    </div>
  )
}