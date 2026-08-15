import path from "path"
import fs from "fs"
import os from "os"
import { calculateGrade } from "./grading"

// Interface for SQLite-compatible DB
export interface IDatabase {
  prepare: (sql: string) => {
    all: (...params: any[]) => any[]
    get: (...params: any[]) => any
    run: (...params: any[]) => { changes: number; lastInsertRowid: number | bigint }
  }
  exec: (sql: string) => void
  pragma: (pragma: string) => any
  transaction: <T extends (...args: any[]) => any>(fn: T) => T
}

// Global reference to avoid re-instantiation across serverless warm calls
let globalDb: IDatabase | null = null
let isInitialized = false

// Seed sample data definition
const SAMPLE_USERS = [
  ["usr-admin-1", "Eleanor Campbell", "admin@newtonsis.edu", "admin", "+91 98765 00001", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "Administration"],
  ["usr-tea-1", "Dr. Marcus Vance", "m.vance@newtonsis.edu", "teacher", "+91 98765 00002", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", "Mathematics"],
  ["usr-tea-2", "Sarah Jenkins", "s.jenkins@newtonsis.edu", "teacher", "+91 98765 00003", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150", "Sciences"],
  ["usr-tea-3", "David Rossi", "d.rossi@newtonsis.edu", "teacher", "+91 98765 00004", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", "Computer Science"],
  ["usr-tea-4", "Claire Dubois", "c.dubois@newtonsis.edu", "teacher", "+91 98765 00005", "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150", "Literature & Arts"],
  ["usr-stu-1", "Ramesh Sharma", "ramesh.sharma@student.newtonsis.edu", "student", "+91 98765 43210", "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150", "Grade 10-A"],
  ["usr-par-1", "Sanjay & Sunita Sharma", "sanjay.sharma@family.com", "parent", "+91 98765 43211", "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150", "Guardian of Ramesh Sharma"],
]

const SAMPLE_CLASSES = [
  ["cls-10a", "Grade 10", "A", "Room 302", "2025-2026", "usr-tea-1"],
  ["cls-10b", "Grade 10", "B", "Room 304", "2025-2026", "usr-tea-2"],
  ["cls-11a", "Grade 11", "A", "Room 401", "2025-2026", "usr-tea-3"],
  ["cls-11b", "Grade 11", "B", "Room 403", "2025-2026", "usr-tea-4"],
  ["cls-12a", "Grade 12", "A", "Lab 201", "2025-2026", "usr-tea-1"],
]

const SAMPLE_SUBJECTS = [
  ["sub-math10", "MTH-101", "Advanced Mathematics", "Calculus, Linear Algebra, and Trigonometry", 4, "Mathematics"],
  ["sub-phy10", "PHY-101", "Physics & Mechanics", "Classical Newtonian mechanics, waves, and optics", 4, "Sciences"],
  ["sub-chem10", "CHM-101", "Chemistry", "Organic chemistry, reaction kinetics, and equilibrium", 3, "Sciences"],
  ["sub-cs10", "CS-101", "Computer Science & Python", "Data structures, algorithms, and web applications", 4, "Computer Science"],
  ["sub-eng10", "ENG-101", "World Literature & Composition", "Critical rhetoric, essay composition, and literary analysis", 3, "Humanities"],
  ["sub-his10", "HIS-101", "Modern World History", "20th-century geopolitical structures and economics", 3, "Social Sciences"],
]

const SAMPLE_CLASS_SUBJECTS = [
  ["cs-1", "cls-10a", "sub-math10", "usr-tea-1", 5],
  ["cs-2", "cls-10a", "sub-phy10", "usr-tea-2", 4],
  ["cs-3", "cls-10a", "sub-chem10", "usr-tea-2", 4],
  ["cs-4", "cls-10a", "sub-cs10", "usr-tea-3", 4],
  ["cs-5", "cls-10a", "sub-eng10", "usr-tea-4", 3],
  ["cs-6", "cls-10a", "sub-his10", "usr-tea-4", 3],
  ["cs-7", "cls-10b", "sub-math10", "usr-tea-1", 5],
  ["cs-8", "cls-10b", "sub-phy10", "usr-tea-2", 4],
  ["cs-9", "cls-11a", "sub-cs10", "usr-tea-3", 5],
  ["cs-10", "cls-11a", "sub-math10", "usr-tea-1", 5],
]

const SAMPLE_STUDENTS = [
  ["stu-1", "STU-2025-001", "Ramesh", "Sharma", "ramesh.sharma@student.newtonsis.edu", "2009-04-15", "Male", "+91 98765 43210", "B-104 Sunrise Heights, Mumbai", "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150", "cls-10a", "Sanjay Sharma", "+91 98765 43211", "sanjay.sharma@family.com", "Active"],
  ["stu-2", "STU-2025-002", "Suresh", "Verma", "suresh.verma@student.newtonsis.edu", "2009-08-22", "Male", "+91 98765 43212", "Flat 402 Green Valley, Pune", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", "cls-10a", "Ramesh Verma", "+91 98765 43213", "r.verma@gmail.com", "Active"],
  ["stu-3", "STU-2025-003", "Nikita", "Patel", "nikita.patel@student.newtonsis.edu", "2009-01-10", "Female", "+91 98765 43214", "Plot 12 Sector 15, Ahmedabad", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "cls-10a", "Mukesh Patel", "+91 98765 43215", "mpatel@techcorp.com", "Active"],
  ["stu-4", "STU-2025-004", "Reeta", "Gupta", "reeta.gupta@student.newtonsis.edu", "2009-11-05", "Female", "+91 98765 43216", "C-88 Indirapuram, Delhi", "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150", "cls-10a", "Alok Gupta", "+91 98765 43217", "alok.gupta@medorg.in", "Active"],
  ["stu-5", "STU-2025-005", "Vaibhav", "Joshi", "vaibhav.joshi@student.newtonsis.edu", "2009-03-30", "Male", "+91 98765 43218", "72 Tilak Nagar, Jaipur", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150", "cls-10a", "Prakash Joshi", "+91 98765 43219", "prakash.joshi@gov.in", "Active"],
  ["stu-6", "STU-2025-006", "Ananya", "Rao", "ananya.rao@student.newtonsis.edu", "2009-07-14", "Female", "+91 98765 43220", "55 Park View, Bengaluru", "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150", "cls-10a", "Venkatesh Rao", "+91 98765 43221", "vrao@lawblr.com", "Active"],
  ["stu-7", "STU-2025-007", "Rohan", "Deshmukh", "rohan.d@student.newtonsis.edu", "2009-09-19", "Male", "+91 98765 43222", "21 Shivaji Park, Mumbai", "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150", "cls-10b", "Anand Deshmukh", "+91 98765 43223", "anand.d@architects.in", "Active"],
  ["stu-8", "STU-2025-008", "Priya", "Nair", "priya.nair@student.newtonsis.edu", "2009-12-03", "Female", "+91 98765 43224", "67 Palm Grove, Kochi", "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150", "cls-10b", "Suresh Nair", "+91 98765 43225", "suresh.nair@arts.org", "Active"],
  ["stu-9", "STU-2025-009", "Aditya", "Mehta", "aditya.m@student.newtonsis.edu", "2008-05-18", "Male", "+91 98765 43226", "102 Pine St, Kolkata", "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150", "cls-11a", "Rajesh Mehta", "+91 98765 43227", "rmehta@design.in", "Active"],
  ["stu-10", "STU-2025-010", "Sneha", "Kulkarni", "sneha.k@student.newtonsis.edu", "2008-10-25", "Female", "+91 98765 43228", "88 Marine Lines, Mumbai", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", "cls-11a", "Mahesh Kulkarni", "+91 98765 43229", "mkulkarni@music.in", "Active"],
  ["stu-11", "STU-2025-011", "Aryan", "Kapoor", "aryan.k@student.newtonsis.edu", "2007-02-14", "Male", "+91 98765 43230", "14 Golf Links, New Delhi", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", "cls-12a", "Vikram Kapoor", "+91 98765 43231", "vikram.k@delhiuniv.ac.in", "Active"],
  ["stu-12", "STU-2025-012", "Neha", "Reddy", "neha.reddy@student.newtonsis.edu", "2009-06-29", "Female", "+91 98765 43232", "9 Jubilee Hills, Hyderabad", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "cls-10a", "Dr. Raghu Reddy", "+91 98765 43233", "rreddy@hospital.in", "Active"],
]

// In-Memory Database Fallback Engine in case better-sqlite3 native bindings fail in serverless
class InMemoryDatabase implements IDatabase {
  private users: any[] = []
  private classes: any[] = []
  private subjects: any[] = []
  private class_subjects: any[] = []
  private students: any[] = []
  private timetables: any[] = []
  private attendance: any[] = []
  private exams: any[] = []
  private grades: any[] = []

  constructor() {
    this.seed()
  }

  pragma() {
    return null
  }

  exec() {
    // No-op for CREATE TABLE statements in memory
  }

  transaction<T extends (...args: any[]) => any>(fn: T): T {
    return ((...args: any[]) => fn(...args)) as T
  }

  private seed() {
    this.users = SAMPLE_USERS.map((u) => ({
      id: u[0], name: u[1], email: u[2], role: u[3], phone: u[4], avatar_url: u[5], department: u[6]
    }))

    this.classes = SAMPLE_CLASSES.map((c) => ({
      id: c[0], grade: c[1], section: c[2], room: c[3], academic_year: c[4], class_teacher_id: c[5]
    }))

    this.subjects = SAMPLE_SUBJECTS.map((s) => ({
      id: s[0], code: s[1], name: s[2], description: s[3], credits: s[4], department: s[5]
    }))

    this.class_subjects = SAMPLE_CLASS_SUBJECTS.map((cs) => ({
      id: cs[0], class_id: cs[1], subject_id: cs[2], teacher_id: cs[3], periods_per_week: cs[4]
    }))

    this.students = SAMPLE_STUDENTS.map((st) => ({
      id: st[0], roll_no: st[1], first_name: st[2], last_name: st[3], email: st[4], dob: st[5],
      gender: st[6], contact: st[7], address: st[8], photo_url: st[9], class_id: st[10],
      guardian_name: st[11], guardian_contact: st[12], guardian_email: st[13], status: st[14],
      enrollment_date: "2026-08-15 17:01:05"
    }))

    // Timetable
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    const periodTemplate = [
      { num: 1, start: "08:30", end: "09:20", sub: "sub-math10", tea: "usr-tea-1", room: "Room 302" },
      { num: 2, start: "09:25", end: "10:15", sub: "sub-phy10", tea: "usr-tea-2", room: "Physics Lab" },
      { num: 3, start: "10:30", end: "11:20", sub: "sub-cs10", tea: "usr-tea-3", room: "CS Lab 1" },
      { num: 4, start: "11:25", end: "12:15", sub: "sub-chem10", tea: "usr-tea-2", room: "Chem Lab" },
      { num: 5, start: "13:00", end: "13:50", sub: "sub-eng10", tea: "usr-tea-4", room: "Room 302" },
      { num: 6, start: "13:55", end: "14:45", sub: "sub-his10", tea: "usr-tea-4", room: "Room 302" },
    ]

    let tId = 1
    days.forEach((day) => {
      periodTemplate.forEach((p) => {
        this.timetables.push({
          id: `tt-${tId++}`,
          class_id: "cls-10a",
          day_of_week: day,
          period_number: p.num,
          start_time: p.start,
          end_time: p.end,
          subject_id: p.sub,
          teacher_id: p.tea,
          room: p.room
        })
      })
    })

    // Exams
    this.exams = [
      { id: "exam-mid-2025", title: "Mid-Term Examination 2025", term: "Fall 2025", academic_year: "2025-2026", start_date: "2025-10-15", end_date: "2025-10-24", status: "Completed" },
      { id: "exam-fin-2025", title: "Final Term Examination 2025", term: "Spring 2026", academic_year: "2025-2026", start_date: "2026-05-10", end_date: "2026-05-20", status: "Completed" },
      { id: "exam-unit-2026", title: "Unit Assessment 1", term: "Fall 2026", academic_year: "2026-2027", start_date: "2026-09-05", end_date: "2026-09-10", status: "Upcoming" }
    ]

    // Attendance
    const pastDates = ["2026-08-04", "2026-08-05", "2026-08-06", "2026-08-07", "2026-08-08", "2026-08-11", "2026-08-12", "2026-08-13", "2026-08-14", "2026-08-15"]
    let attId = 1
    this.students.filter((s) => s.class_id === "cls-10a").forEach((st) => {
      pastDates.forEach((dt, idx) => {
        let status = "Present"
        if (st.id === "stu-5" && (idx === 1 || idx === 3 || idx === 6 || idx === 8)) status = "Absent"
        else if (st.id === "stu-3" && idx === 4) status = "Late"
        else if (st.id === "stu-1" && idx === 7) status = "Excused"

        this.attendance.push({
          id: `att-${attId++}`,
          student_id: st.id,
          class_id: "cls-10a",
          date: dt,
          status,
          remarks: status === "Excused" ? "Medical appointment" : status === "Late" ? "Bus delay" : "",
          marked_by: "usr-tea-1",
          created_at: "2026-08-15 17:01:05"
        })
      })
    })

    // Grades
    let grId = 1
    const grade10Students = ["stu-1", "stu-2", "stu-3", "stu-4", "stu-5", "stu-6", "stu-12"]
    const subjectIds = ["sub-math10", "sub-phy10", "sub-chem10", "sub-cs10", "sub-eng10", "sub-his10"]

    grade10Students.forEach((stId) => {
      subjectIds.forEach((subId) => {
        // Midterm
        let mScore = 88
        if (stId === "stu-1") mScore = subId === "sub-cs10" ? 98 : subId === "sub-math10" ? 94 : 92
        else if (stId === "stu-5") mScore = 65
        const mGrade = calculateGrade(mScore, 100)
        this.grades.push({
          id: `gr-${grId++}`,
          student_id: stId,
          exam_id: "exam-mid-2025",
          subject_id: subId,
          marks_obtained: mScore,
          total_marks: 100,
          grade_point: mGrade.point,
          letter_grade: mGrade.letter,
          remarks: mScore >= 90 ? "Outstanding concept mastery" : "Solid performance"
        })

        // Final
        let fScore = 91
        if (stId === "stu-1") fScore = subId === "sub-cs10" ? 99 : subId === "sub-math10" ? 96 : 91
        else if (stId === "stu-5") fScore = 64
        const fGrade = calculateGrade(fScore, 100)
        this.grades.push({
          id: `gr-${grId++}`,
          student_id: stId,
          exam_id: "exam-fin-2025",
          subject_id: subId,
          marks_obtained: fScore,
          total_marks: 100,
          grade_point: fGrade.point,
          letter_grade: fGrade.letter,
          remarks: "Consolidated semester evaluation"
        })
      })
    })
  }

  prepare(sql: string) {
    const cleanSql = sql.trim()
    const isSelect = cleanSql.toUpperCase().startsWith("SELECT")
    const isInsert = cleanSql.toUpperCase().startsWith("INSERT")
    const isUpdate = cleanSql.toUpperCase().startsWith("UPDATE")
    const isDelete = cleanSql.toUpperCase().startsWith("DELETE")

    return {
      all: (...params: any[]): any[] => {
        if (cleanSql.includes("FROM users WHERE role = 'teacher'")) {
          return this.users.filter((u) => u.role === "teacher")
        }

        if (cleanSql.includes("FROM classes c")) {
          return this.classes.map((c) => {
            const teacher = this.users.find((u) => u.id === c.class_teacher_id)
            const studentCount = this.students.filter((s) => s.class_id === c.id).length
            return {
              ...c,
              class_teacher_name: teacher ? teacher.name : "Unassigned",
              student_count: studentCount
            }
          })
        }

        if (cleanSql.includes("FROM subjects s")) {
          return this.subjects.map((s) => {
            const classCount = this.class_subjects.filter((cs) => cs.subject_id === s.id).length
            return { ...s, class_count: classCount }
          })
        }

        if (cleanSql.includes("FROM class_subjects cs")) {
          let list = this.class_subjects
          if (params[0]) {
            list = list.filter((cs) => cs.class_id === params[0])
          }
          return list.map((cs) => {
            const cls = this.classes.find((c) => c.id === cs.class_id)
            const sub = this.subjects.find((s) => s.id === cs.subject_id)
            const teacher = this.users.find((u) => u.id === cs.teacher_id)
            return {
              ...cs,
              grade: cls?.grade,
              section: cls?.section,
              subject_name: sub?.name,
              subject_code: sub?.code,
              credits: sub?.credits,
              teacher_name: teacher?.name
            }
          })
        }

        if (cleanSql.includes("FROM exams")) {
          return [...this.exams].sort((a, b) => b.start_date.localeCompare(a.start_date))
        }

        if (cleanSql.includes("FROM timetables t")) {
          const classId = params[0] || "cls-10a"
          return this.timetables
            .filter((t) => t.class_id === classId)
            .map((t) => {
              const sub = this.subjects.find((s) => s.id === t.subject_id)
              const teacher = this.users.find((u) => u.id === t.teacher_id)
              return {
                ...t,
                subject_name: sub?.name || "Subject",
                subject_code: sub?.code || "SUB-101",
                teacher_name: teacher?.name || "Teacher"
              }
            })
            .sort((a, b) => a.period_number - b.period_number)
        }

        if (cleanSql.includes("FROM attendance a") && cleanSql.includes("WHERE student_id = ?")) {
          const stId = params[0]
          return this.attendance
            .filter((a) => a.student_id === stId)
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 30)
        }

        if (cleanSql.includes("FROM grades g") && cleanSql.includes("WHERE g.student_id = ?")) {
          const stId = params[0]
          return this.grades
            .filter((g) => g.student_id === stId)
            .map((g) => {
              const sub = this.subjects.find((s) => s.id === g.subject_id)
              const ex = this.exams.find((e) => e.id === g.exam_id)
              return {
                ...g,
                subject_name: sub?.name || "Subject",
                subject_code: sub?.code || "SUB",
                credits: sub?.credits || 3,
                exam_title: ex?.title || "Exam",
                exam_term: ex?.term || "Term"
              }
            })
        }

        if (cleanSql.includes("FROM students s") && cleanSql.includes("LEFT JOIN attendance a")) {
          const [date, classId] = params
          return this.students
            .filter((s) => !classId || s.class_id === classId)
            .map((s) => {
              const att = this.attendance.find((a) => a.student_id === s.id && a.date === date)
              return {
                student_id: s.id,
                roll_no: s.roll_no,
                first_name: s.first_name,
                last_name: s.last_name,
                photo_url: s.photo_url,
                status: att?.status || "Present",
                remarks: att?.remarks || "",
                attendance_id: att?.id || null
              }
            })
        }

        if (cleanSql.includes("FROM students s") && cleanSql.includes("LEFT JOIN grades g")) {
          const [examId, subjectId, classId] = params
          return this.students
            .filter((s) => !classId || s.class_id === classId)
            .map((s) => {
              const gr = this.grades.find((g) => g.student_id === s.id && g.exam_id === examId && g.subject_id === subjectId)
              return {
                student_id: s.id,
                roll_no: s.roll_no,
                first_name: s.first_name,
                last_name: s.last_name,
                grade_id: gr?.id || null,
                marks_obtained: gr?.marks_obtained ?? null,
                total_marks: gr?.total_marks ?? 100,
                grade_point: gr?.grade_point ?? null,
                letter_grade: gr?.letter_grade ?? null,
                remarks: gr?.remarks ?? null
              }
            })
        }

        if (cleanSql.includes("HAVING attendance_percentage < 75.0")) {
          return this.students
            .map((s) => {
              const atts = this.attendance.filter((a) => a.student_id === s.id)
              const totalDays = atts.length || 10
              const presentDays = atts.filter((a) => a.status === "Present" || a.status === "Late").length
              const absentDays = atts.filter((a) => a.status === "Absent").length
              const pct = totalDays > 0 ? Math.round((presentDays * 100.0) / totalDays) : 95
              const cls = this.classes.find((c) => c.id === s.class_id)
              return {
                id: s.id,
                roll_no: s.roll_no,
                first_name: s.first_name,
                last_name: s.last_name,
                photo_url: s.photo_url,
                guardian_name: s.guardian_name,
                guardian_contact: s.guardian_contact,
                grade: cls?.grade,
                section: cls?.section,
                total_days: totalDays,
                absent_days: absentDays,
                attendance_percentage: pct
              }
            })
            .filter((s) => s.attendance_percentage < 75.0)
        }

        // Generic Students Query
        return this.students.map((s) => {
          const cls = this.classes.find((c) => c.id === s.class_id)
          const atts = this.attendance.filter((a) => a.student_id === s.id)
          const totalDays = atts.length || 10
          const presentDays = atts.filter((a) => a.status === "Present" || a.status === "Late").length
          const attRate = totalDays > 0 ? Math.round((presentDays * 100.0) / totalDays) : 95
          const stGrades = this.grades.filter((g) => g.student_id === s.id && g.exam_id === "exam-fin-2025")
          const avgGpa = stGrades.length > 0
            ? Number((stGrades.reduce((sum, g) => sum + (g.grade_point || 0), 0) / stGrades.length).toFixed(2))
            : 3.6

          return {
            ...s,
            grade: cls?.grade || "Grade 10",
            section: cls?.section || "A",
            room: cls?.room || "Room 302",
            academic_year: cls?.academic_year || "2025-2026",
            attendance_rate: attRate,
            current_gpa: avgGpa
          }
        })
      },

      get: (...params: any[]): any => {
        if (cleanSql.includes("FROM students s") && cleanSql.includes("WHERE s.id = ?")) {
          const stId = params[0]
          const s = this.students.find((stu) => stu.id === stId)
          if (!s) return undefined
          const cls = this.classes.find((c) => c.id === s.class_id)
          const teacher = this.users.find((u) => u.id === cls?.class_teacher_id)
          return {
            ...s,
            grade: cls?.grade || "Grade 10",
            section: cls?.section || "A",
            room: cls?.room || "Room 302",
            academic_year: cls?.academic_year || "2025-2026",
            class_teacher_name: teacher?.name || "Dr. Marcus Vance",
            class_teacher_email: teacher?.email || "m.vance@newtonsis.edu"
          }
        }

        if (cleanSql.includes("FROM attendance") && cleanSql.includes("WHERE student_id = ?")) {
          const stId = params[0]
          const atts = this.attendance.filter((a) => a.student_id === stId)
          const totalDays = atts.length || 10
          const presentCount = atts.filter((a) => a.status === "Present").length
          const lateCount = atts.filter((a) => a.status === "Late").length
          const absentCount = atts.filter((a) => a.status === "Absent").length
          const excusedCount = atts.filter((a) => a.status === "Excused").length
          const pct = totalDays > 0 ? Number(((presentCount + lateCount) * 100.0 / totalDays).toFixed(1)) : 90
          return {
            total_days: totalDays,
            present_count: presentCount,
            late_count: lateCount,
            absent_count: absentCount,
            excused_count: excusedCount,
            percentage: pct
          }
        }

        if (cleanSql.includes("COUNT(CASE WHEN a.status = 'Present'")) {
          const totalRecords = this.attendance.length || 100
          const presentCount = this.attendance.filter((a) => a.status === "Present").length
          const lateCount = this.attendance.filter((a) => a.status === "Late").length
          const absentCount = this.attendance.filter((a) => a.status === "Absent").length
          const excusedCount = this.attendance.filter((a) => a.status === "Excused").length
          const avg = totalRecords > 0 ? Number(((presentCount + lateCount) * 100.0 / totalRecords).toFixed(1)) : 94.8
          return {
            total_records: totalRecords,
            present_count: presentCount,
            late_count: lateCount,
            absent_count: absentCount,
            excused_count: excusedCount,
            average_rate: avg
          }
        }

        if (cleanSql.includes("FROM exams WHERE id = ?")) {
          return this.exams.find((e) => e.id === params[0]) || this.exams[0]
        }

        if (cleanSql.includes("SELECT count(*) as count FROM users")) {
          return { count: this.users.length }
        }

        return undefined
      },

      run: (...params: any[]): { changes: number; lastInsertRowid: number | bigint } => {
        if (isInsert && cleanSql.includes("INTO students")) {
          const [id, roll_no, first_name, last_name, email, dob, gender, contact, address, photo_url, class_id, guardian_name, guardian_contact, guardian_email, status] = params
          this.students.push({
            id, roll_no, first_name, last_name, email, dob, gender, contact, address, photo_url, class_id, guardian_name, guardian_contact, guardian_email, status
          })
          return { changes: 1, lastInsertRowid: this.students.length }
        }

        if (isUpdate && cleanSql.includes("UPDATE students")) {
          const id = params[params.length - 1]
          const st = this.students.find((s) => s.id === id)
          if (st) {
            const [first_name, last_name, roll_no, email, dob, gender, contact, address, photo_url, class_id, guardian_name, guardian_contact, guardian_email, status] = params
            if (first_name) st.first_name = first_name
            if (last_name) st.last_name = last_name
            if (roll_no) st.roll_no = roll_no
            if (email) st.email = email
            if (dob) st.dob = dob
            if (gender) st.gender = gender
            if (contact) st.contact = contact
            if (address) st.address = address
            if (photo_url) st.photo_url = photo_url
            if (class_id) st.class_id = class_id
            if (guardian_name) st.guardian_name = guardian_name
            if (guardian_contact) st.guardian_contact = guardian_contact
            if (guardian_email) st.guardian_email = guardian_email
            if (status) st.status = status
            return { changes: 1, lastInsertRowid: 1 }
          }
        }

        if (isDelete && cleanSql.includes("FROM students")) {
          const id = params[0]
          this.students = this.students.filter((s) => s.id !== id)
          return { changes: 1, lastInsertRowid: 1 }
        }

        if (cleanSql.includes("INTO attendance")) {
          const [id, student_id, class_id, date, status, remarks, marked_by] = params
          const existing = this.attendance.find((a) => a.student_id === student_id && a.date === date)
          if (existing) {
            existing.status = status
            existing.remarks = remarks
            existing.marked_by = marked_by
          } else {
            this.attendance.push({ id, student_id, class_id, date, status, remarks, marked_by })
          }
          return { changes: 1, lastInsertRowid: 1 }
        }

        if (cleanSql.includes("INTO grades")) {
          const [id, student_id, exam_id, subject_id, marks_obtained, total_marks, grade_point, letter_grade, remarks] = params
          const existing = this.grades.find((g) => g.student_id === student_id && g.exam_id === exam_id && g.subject_id === subject_id)
          if (existing) {
            existing.marks_obtained = marks_obtained
            existing.total_marks = total_marks
            existing.grade_point = grade_point
            existing.letter_grade = letter_grade
            existing.remarks = remarks
          } else {
            this.grades.push({ id, student_id, exam_id, subject_id, marks_obtained, total_marks, grade_point, letter_grade, remarks })
          }
          return { changes: 1, lastInsertRowid: 1 }
        }

        if (cleanSql.includes("INTO classes")) {
          const [id, grade, section, room, academic_year, class_teacher_id] = params
          this.classes.push({ id, grade, section, room, academic_year, class_teacher_id })
          return { changes: 1, lastInsertRowid: this.classes.length }
        }

        if (cleanSql.includes("INTO subjects")) {
          const [id, code, name, description, credits, department] = params
          this.subjects.push({ id, code, name, description, credits, department })
          return { changes: 1, lastInsertRowid: this.subjects.length }
        }

        if (cleanSql.includes("INTO class_subjects")) {
          const [id, class_id, subject_id, teacher_id, periods_per_week] = params
          this.class_subjects.push({ id, class_id, subject_id, teacher_id, periods_per_week })
          return { changes: 1, lastInsertRowid: this.class_subjects.length }
        }

        return { changes: 1, lastInsertRowid: 1 }
      }
    }
  }
}

// Get or initialize the database instance
function getDatabaseInstance(): IDatabase {
  if (globalDb) return globalDb

  // Check if we should use SQLite or In-Memory
  try {
    // Attempt to require better-sqlite3 dynamically
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require("better-sqlite3")

    // Determine safe writable location (especially on Vercel / serverless)
    let dbPath = path.join(process.cwd(), "data", "school.db")
    const isVercel = process.env.VERCEL === "1" || !process.env.NODE_ENV || process.env.NODE_ENV === "production"

    if (isVercel) {
      // In serverless, use /tmp which is the only writable directory
      dbPath = path.join(os.tmpdir(), "school.db")
    } else {
      const dataDir = path.dirname(dbPath)
      if (!fs.existsSync(dataDir)) {
        try {
          fs.mkdirSync(dataDir, { recursive: true })
        } catch {
          dbPath = path.join(os.tmpdir(), "school.db")
        }
      }
    }

    const sqliteDb = new Database(dbPath)
    try {
      sqliteDb.pragma("journal_mode = MEMORY")
      sqliteDb.pragma("foreign_keys = ON")
    } catch {
      // Ignore pragma failures in restricted environments
    }

    globalDb = sqliteDb
    return globalDb!
  } catch (err) {
    console.warn("better-sqlite3 not available or failed to load in serverless. Using resilient in-memory database store:", err)
    globalDb = new InMemoryDatabase()
    return globalDb
  }
}

// Export database proxy
export const db = new Proxy({} as IDatabase, {
  get(_target, prop) {
    const instance = getDatabaseInstance()
    const val = (instance as any)[prop]
    if (typeof val === "function") {
      return val.bind(instance)
    }
    return val
  }
})

// Run schema initialization and seeding
export function initDatabase() {
  if (isInitialized) return
  isInitialized = true

  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'teacher', 'student', 'parent')),
        phone TEXT,
        avatar_url TEXT,
        department TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS classes (
        id TEXT PRIMARY KEY,
        grade TEXT NOT NULL,
        section TEXT NOT NULL,
        room TEXT NOT NULL,
        academic_year TEXT NOT NULL,
        class_teacher_id TEXT,
        FOREIGN KEY (class_teacher_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        credits INTEGER DEFAULT 3,
        department TEXT
      );

      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        roll_no TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        dob TEXT NOT NULL,
        gender TEXT NOT NULL CHECK(gender IN ('Male', 'Female', 'Other')),
        contact TEXT NOT NULL,
        address TEXT NOT NULL,
        photo_url TEXT,
        class_id TEXT NOT NULL,
        guardian_name TEXT NOT NULL,
        guardian_contact TEXT NOT NULL,
        guardian_email TEXT,
        status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive', 'Suspended', 'Alumni')),
        enrollment_date TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (class_id) REFERENCES classes(id)
      );

      CREATE TABLE IF NOT EXISTS class_subjects (
        id TEXT PRIMARY KEY,
        class_id TEXT NOT NULL,
        subject_id TEXT NOT NULL,
        teacher_id TEXT NOT NULL,
        periods_per_week INTEGER DEFAULT 4,
        FOREIGN KEY (class_id) REFERENCES classes(id),
        FOREIGN KEY (subject_id) REFERENCES subjects(id),
        FOREIGN KEY (teacher_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS timetables (
        id TEXT PRIMARY KEY,
        class_id TEXT NOT NULL,
        day_of_week TEXT NOT NULL CHECK(day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')),
        period_number INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        subject_id TEXT NOT NULL,
        teacher_id TEXT NOT NULL,
        room TEXT,
        FOREIGN KEY (class_id) REFERENCES classes(id),
        FOREIGN KEY (subject_id) REFERENCES subjects(id),
        FOREIGN KEY (teacher_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        class_id TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('Present', 'Absent', 'Late', 'Excused')),
        remarks TEXT,
        marked_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, date),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES classes(id)
      );

      CREATE TABLE IF NOT EXISTS exams (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        term TEXT NOT NULL,
        academic_year TEXT NOT NULL,
        start_date TEXT,
        end_date TEXT,
        status TEXT DEFAULT 'Completed'
      );

      CREATE TABLE IF NOT EXISTS grades (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        exam_id TEXT NOT NULL,
        subject_id TEXT NOT NULL,
        marks_obtained REAL NOT NULL,
        total_marks REAL DEFAULT 100,
        grade_point REAL,
        letter_grade TEXT,
        remarks TEXT,
        UNIQUE(student_id, exam_id, subject_id),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (exam_id) REFERENCES exams(id),
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
      );
    `)

    // Seed sample data if empty
    const userCount = db.prepare("SELECT count(*) as count FROM users").get() as { count: number } | undefined
    if (!userCount || userCount.count === 0) {
      seedSampleData()
    }
  } catch (e) {
    console.error("initDatabase error (handled):", e)
  }
}

function seedSampleData() {
  try {
    const insertUser = db.prepare(`
      INSERT INTO users (id, name, email, role, phone, avatar_url, department)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    SAMPLE_USERS.forEach((u) => insertUser.run(...u))

    const insertClass = db.prepare(`
      INSERT INTO classes (id, grade, section, room, academic_year, class_teacher_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    SAMPLE_CLASSES.forEach((c) => insertClass.run(...c))

    const insertSubject = db.prepare(`
      INSERT INTO subjects (id, code, name, description, credits, department)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    SAMPLE_SUBJECTS.forEach((s) => insertSubject.run(...s))

    const insertClassSubject = db.prepare(`
      INSERT INTO class_subjects (id, class_id, subject_id, teacher_id, periods_per_week)
      VALUES (?, ?, ?, ?, ?)
    `)
    SAMPLE_CLASS_SUBJECTS.forEach((cs) => insertClassSubject.run(...cs))

    const insertStudent = db.prepare(`
      INSERT INTO students (
        id, roll_no, first_name, last_name, email, dob, gender, contact,
        address, photo_url, class_id, guardian_name, guardian_contact, guardian_email, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    SAMPLE_STUDENTS.forEach((st) => insertStudent.run(...st))

    const insertTimetable = db.prepare(`
      INSERT INTO timetables (id, class_id, day_of_week, period_number, start_time, end_time, subject_id, teacher_id, room)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    const periodTemplate = [
      { num: 1, start: "08:30", end: "09:20", sub: "sub-math10", tea: "usr-tea-1", room: "Room 302" },
      { num: 2, start: "09:25", end: "10:15", sub: "sub-phy10", tea: "usr-tea-2", room: "Physics Lab" },
      { num: 3, start: "10:30", end: "11:20", sub: "sub-cs10", tea: "usr-tea-3", room: "CS Lab 1" },
      { num: 4, start: "11:25", end: "12:15", sub: "sub-chem10", tea: "usr-tea-2", room: "Chem Lab" },
      { num: 5, start: "13:00", end: "13:50", sub: "sub-eng10", tea: "usr-tea-4", room: "Room 302" },
      { num: 6, start: "13:55", end: "14:45", sub: "sub-his10", tea: "usr-tea-4", room: "Room 302" },
    ]

    let tId = 1
    days.forEach((day) => {
      periodTemplate.forEach((p) => {
        insertTimetable.run(`tt-${tId++}`, "cls-10a", day, p.num, p.start, p.end, p.sub, p.tea, p.room)
      })
    })

    const insertAttendance = db.prepare(`
      INSERT OR IGNORE INTO attendance (id, student_id, class_id, date, status, remarks, marked_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    const pastDates = ["2026-08-04", "2026-08-05", "2026-08-06", "2026-08-07", "2026-08-08", "2026-08-11", "2026-08-12", "2026-08-13", "2026-08-14", "2026-08-15"]
    let attId = 1
    SAMPLE_STUDENTS.filter((s) => s[10] === "cls-10a").forEach((st) => {
      pastDates.forEach((dt, idx) => {
        let status = "Present"
        if (st[0] === "stu-5" && (idx === 1 || idx === 3 || idx === 6 || idx === 8)) status = "Absent"
        else if (st[0] === "stu-3" && idx === 4) status = "Late"
        else if (st[0] === "stu-1" && idx === 7) status = "Excused"

        insertAttendance.run(
          `att-${attId++}`,
          st[0],
          "cls-10a",
          dt,
          status,
          status === "Excused" ? "Medical appointment" : status === "Late" ? "Bus delay" : "",
          "usr-tea-1"
        )
      })
    })

    const insertExam = db.prepare(`
      INSERT INTO exams (id, title, term, academic_year, start_date, end_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    insertExam.run("exam-mid-2025", "Mid-Term Examination 2025", "Fall 2025", "2025-2026", "2025-10-15", "2025-10-24", "Completed")
    insertExam.run("exam-fin-2025", "Final Term Examination 2025", "Spring 2026", "2025-2026", "2026-05-10", "2026-05-20", "Completed")
    insertExam.run("exam-unit-2026", "Unit Assessment 1", "Fall 2026", "2026-2027", "2026-09-05", "2026-09-10", "Upcoming")

    const insertGrade = db.prepare(`
      INSERT INTO grades (id, student_id, exam_id, subject_id, marks_obtained, total_marks, grade_point, letter_grade, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    let grId = 1
    const grade10Students = ["stu-1", "stu-2", "stu-3", "stu-4", "stu-5", "stu-6", "stu-12"]
    const subjectIds = ["sub-math10", "sub-phy10", "sub-chem10", "sub-cs10", "sub-eng10", "sub-his10"]

    grade10Students.forEach((stId) => {
      subjectIds.forEach((subId) => {
        let score = 88
        if (stId === "stu-1") score = subId === "sub-cs10" ? 98 : subId === "sub-math10" ? 94 : 92
        if (stId === "stu-5") score = 65
        const { point, letter } = calculateGrade(score, 100)
        insertGrade.run(`gr-${grId++}`, stId, "exam-mid-2025", subId, score, 100, point, letter, score >= 90 ? "Outstanding concept mastery" : "Solid performance")
      })
    })

    grade10Students.forEach((stId) => {
      subjectIds.forEach((subId) => {
        let score = 91
        if (stId === "stu-1") score = subId === "sub-cs10" ? 99 : subId === "sub-math10" ? 96 : 91
        if (stId === "stu-5") score = 64
        const { point, letter } = calculateGrade(score, 100)
        insertGrade.run(`gr-${grId++}`, stId, "exam-fin-2025", subId, score, 100, point, letter, "Consolidated semester evaluation")
      })
    })
  } catch (e) {
    console.error("seedSampleData error (handled):", e)
  }
}

// Helper query functions
export function getClasses() {
  initDatabase()
  return db.prepare(`
    SELECT c.*, u.name as class_teacher_name,
      (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id) as student_count
    FROM classes c
    LEFT JOIN users u ON c.class_teacher_id = u.id
    ORDER BY c.grade, c.section
  `).all()
}

export function getSubjects() {
  initDatabase()
  return db.prepare(`
    SELECT s.*, 
      (SELECT COUNT(*) FROM class_subjects cs WHERE cs.subject_id = s.id) as class_count
    FROM subjects s
    ORDER BY s.name
  `).all()
}

export function getTeachers() {
  initDatabase()
  return db.prepare(`
    SELECT * FROM users WHERE role = 'teacher' ORDER BY name
  `).all()
}

export function getAllStudents() {
  initDatabase()
  return db.prepare(`
    SELECT 
      s.*,
      c.grade,
      c.section,
      c.room,
      (
        SELECT ROUND(
          (COUNT(CASE WHEN a.status IN ('Present', 'Late') THEN 1 END) * 100.0) / NULLIF(COUNT(*), 0),
          1
        )
        FROM attendance a WHERE a.student_id = s.id
      ) as attendance_rate,
      (
        SELECT ROUND(AVG(g.grade_point), 2)
        FROM grades g WHERE g.student_id = s.id AND g.exam_id = 'exam-fin-2025'
      ) as current_gpa
    FROM students s
    JOIN classes c ON s.class_id = c.id
    ORDER BY s.roll_no ASC
  `).all()
}

export function getStudentById(id: string) {
  initDatabase()
  const student = db.prepare(`
    SELECT 
      s.*,
      c.grade,
      c.section,
      c.room,
      c.academic_year,
      u.name as class_teacher_name,
      u.email as class_teacher_email
    FROM students s
    JOIN classes c ON s.class_id = c.id
    LEFT JOIN users u ON c.class_teacher_id = u.id
    WHERE s.id = ?
  `).get(id) as any

  if (!student) return null

  // Get Grades
  const grades = db.prepare(`
    SELECT 
      g.*,
      sub.name as subject_name,
      sub.code as subject_code,
      sub.credits,
      e.title as exam_title,
      e.term as exam_term
    FROM grades g
    JOIN subjects sub ON g.subject_id = sub.id
    JOIN exams e ON g.exam_id = e.id
    WHERE g.student_id = ?
    ORDER BY e.start_date DESC, sub.name ASC
  `).all(id)

  // Get Attendance History
  const attendance = db.prepare(`
    SELECT * FROM attendance
    WHERE student_id = ?
    ORDER BY date DESC
    LIMIT 30
  `).all(id)

  // Stats
  const attendanceStats = db.prepare(`
    SELECT 
      COUNT(*) as total_days,
      COUNT(CASE WHEN status = 'Present' THEN 1 END) as present_count,
      COUNT(CASE WHEN status = 'Late' THEN 1 END) as late_count,
      COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent_count,
      COUNT(CASE WHEN status = 'Excused' THEN 1 END) as excused_count,
      ROUND(
        (COUNT(CASE WHEN status IN ('Present', 'Late') THEN 1 END) * 100.0) / NULLIF(COUNT(*), 0),
        1
      ) as percentage
    FROM attendance
    WHERE student_id = ?
  `).get(id)

  return {
    ...student,
    grades,
    attendance,
    attendanceStats,
  }
}

export function getTimetable(classId: string = "cls-10a") {
  initDatabase()
  return db.prepare(`
    SELECT 
      t.*,
      s.name as subject_name,
      s.code as subject_code,
      u.name as teacher_name
    FROM timetables t
    JOIN subjects s ON t.subject_id = s.id
    JOIN users u ON t.teacher_id = u.id
    WHERE t.class_id = ?
    ORDER BY t.period_number ASC
  `).all(classId)
}

export function getAttendanceForClass(classId: string, date: string) {
  initDatabase()
  return db.prepare(`
    SELECT 
      s.id as student_id,
      s.roll_no,
      s.first_name,
      s.last_name,
      s.photo_url,
      COALESCE(a.status, 'Present') as status,
      a.remarks,
      a.id as attendance_id
    FROM students s
    LEFT JOIN attendance a ON a.student_id = s.id AND a.date = ?
    WHERE s.class_id = ?
    ORDER BY s.roll_no ASC
  `).all(date, classId)
}

export function getExams() {
  initDatabase()
  return db.prepare(`SELECT * FROM exams ORDER BY start_date DESC`).all()
}

export function getGradesForExam(classId: string, examId: string, subjectId: string) {
  initDatabase()
  return db.prepare(`
    SELECT 
      s.id as student_id,
      s.roll_no,
      s.first_name,
      s.last_name,
      g.id as grade_id,
      g.marks_obtained,
      g.total_marks,
      g.grade_point,
      g.letter_grade,
      g.remarks
    FROM students s
    LEFT JOIN grades g ON g.student_id = s.id AND g.exam_id = ? AND g.subject_id = ?
    WHERE s.class_id = ?
    ORDER BY s.roll_no ASC
  `).all(examId, subjectId, classId)
}

export { calculateGrade }
