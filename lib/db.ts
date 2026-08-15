import Database from "better-sqlite3"
import path from "path"
import fs from "fs"
import { calculateGrade } from "./grading"

// Initialize database
const dbPath = path.join(process.cwd(), "data", "school.db")
const dataDir = path.dirname(dbPath)

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

export const db = new Database(dbPath)
db.pragma("journal_mode = WAL")
db.pragma("foreign_keys = ON")

// Run schema initialization and seeding
export function initDatabase() {
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
  const userCount = db.prepare("SELECT count(*) as count FROM users").get() as { count: number }
  if (userCount.count === 0) {
    seedSampleData()
  }
}


function seedSampleData() {
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, role, phone, avatar_url, department)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  const users = [
    ["usr-admin-1", "Eleanor Campbell", "admin@newtonsis.edu", "admin", "+91 98765 00001", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "Administration"],
    ["usr-tea-1", "Dr. Marcus Vance", "m.vance@newtonsis.edu", "teacher", "+91 98765 00002", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", "Mathematics"],
    ["usr-tea-2", "Sarah Jenkins", "s.jenkins@newtonsis.edu", "teacher", "+91 98765 00003", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150", "Sciences"],
    ["usr-tea-3", "David Rossi", "d.rossi@newtonsis.edu", "teacher", "+91 98765 00004", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", "Computer Science"],
    ["usr-tea-4", "Claire Dubois", "c.dubois@newtonsis.edu", "teacher", "+91 98765 00005", "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150", "Literature & Arts"],
    ["usr-stu-1", "Ramesh Sharma", "ramesh.sharma@student.newtonsis.edu", "student", "+91 98765 43210", "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150", "Grade 10-A"],
    ["usr-par-1", "Sanjay & Sunita Sharma", "sanjay.sharma@family.com", "parent", "+91 98765 43211", "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150", "Guardian of Ramesh Sharma"],
  ]

  users.forEach((u) => insertUser.run(...u))

  // Classes
  const insertClass = db.prepare(`
    INSERT INTO classes (id, grade, section, room, academic_year, class_teacher_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const classes = [
    ["cls-10a", "Grade 10", "A", "Room 302", "2025-2026", "usr-tea-1"],
    ["cls-10b", "Grade 10", "B", "Room 304", "2025-2026", "usr-tea-2"],
    ["cls-11a", "Grade 11", "A", "Room 401", "2025-2026", "usr-tea-3"],
    ["cls-11b", "Grade 11", "B", "Room 403", "2025-2026", "usr-tea-4"],
    ["cls-12a", "Grade 12", "A", "Lab 201", "2025-2026", "usr-tea-1"],
  ]

  classes.forEach((c) => insertClass.run(...c))

  // Subjects
  const insertSubject = db.prepare(`
    INSERT INTO subjects (id, code, name, description, credits, department)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const subjects = [
    ["sub-math10", "MTH-101", "Advanced Mathematics", "Calculus, Linear Algebra, and Trigonometry", 4, "Mathematics"],
    ["sub-phy10", "PHY-101", "Physics & Mechanics", "Classical Newtonian mechanics, waves, and optics", 4, "Sciences"],
    ["sub-chem10", "CHM-101", "Chemistry", "Organic chemistry, reaction kinetics, and equilibrium", 3, "Sciences"],
    ["sub-cs10", "CS-101", "Computer Science & Python", "Data structures, algorithms, and web applications", 4, "Computer Science"],
    ["sub-eng10", "ENG-101", "World Literature & Composition", "Critical rhetoric, essay composition, and literary analysis", 3, "Humanities"],
    ["sub-his10", "HIS-101", "Modern World History", "20th-century geopolitical structures and economics", 3, "Social Sciences"],
  ]

  subjects.forEach((s) => insertSubject.run(...s))

  // Class Subject allocations
  const insertClassSubject = db.prepare(`
    INSERT INTO class_subjects (id, class_id, subject_id, teacher_id, periods_per_week)
    VALUES (?, ?, ?, ?, ?)
  `)

  const classSubs = [
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

  classSubs.forEach((cs) => insertClassSubject.run(...cs))

  // Students (12 realistic students across classes)
  const insertStudent = db.prepare(`
    INSERT INTO students (
      id, roll_no, first_name, last_name, email, dob, gender, contact,
      address, photo_url, class_id, guardian_name, guardian_contact, guardian_email, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const studentList = [
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

  studentList.forEach((st) => insertStudent.run(...st))

  // Timetables (Grade 10-A weekly schedule)
  const insertTimetable = db.prepare(`
    INSERT INTO timetables (id, class_id, day_of_week, period_number, start_time, end_time, subject_id, teacher_id, room)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const days: ("Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday")[] = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
  ]

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
      insertTimetable.run(
        `tt-${tId++}`,
        "cls-10a",
        day,
        p.num,
        p.start,
        p.end,
        p.sub,
        p.tea,
        p.room
      )
    })
  })

  // Attendance for past 10 days for Grade 10-A students
  const insertAttendance = db.prepare(`
    INSERT OR IGNORE INTO attendance (id, student_id, class_id, date, status, remarks, marked_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  const pastDates = [
    "2026-08-04", "2026-08-05", "2026-08-06", "2026-08-07", "2026-08-08",
    "2026-08-11", "2026-08-12", "2026-08-13", "2026-08-14", "2026-08-15"
  ]

  let attId = 1
  studentList.filter((s) => s[10] === "cls-10a").forEach((st) => {
    pastDates.forEach((dt, idx) => {
      // Create realistic attendance variation: Liam 95%, Sophia 100%, Noah has lower attendance (60% low attendance flag)
      let status = "Present"
      if (st[0] === "stu-5" && (idx === 1 || idx === 3 || idx === 6 || idx === 8)) {
        status = "Absent"
      } else if (st[0] === "stu-3" && idx === 4) {
        status = "Late"
      } else if (st[0] === "stu-1" && idx === 7) {
        status = "Excused"
      }

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

  // Exams
  const insertExam = db.prepare(`
    INSERT INTO exams (id, title, term, academic_year, start_date, end_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  insertExam.run("exam-mid-2025", "Mid-Term Examination 2025", "Fall 2025", "2025-2026", "2025-10-15", "2025-10-24", "Completed")
  insertExam.run("exam-fin-2025", "Final Term Examination 2025", "Spring 2026", "2025-2026", "2026-05-10", "2026-05-20", "Completed")
  insertExam.run("exam-unit-2026", "Unit Assessment 1", "Fall 2026", "2026-2027", "2026-09-05", "2026-09-10", "Upcoming")

  // Grades for Grade 10-A students across subjects
  const insertGrade = db.prepare(`
    INSERT INTO grades (id, student_id, exam_id, subject_id, marks_obtained, total_marks, grade_point, letter_grade, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  let grId = 1
  const grade10Students = ["stu-1", "stu-2", "stu-3", "stu-4", "stu-5", "stu-6", "stu-12"]
  const subjectIds = ["sub-math10", "sub-phy10", "sub-chem10", "sub-cs10", "sub-eng10", "sub-his10"]

  // Midterm scores
  grade10Students.forEach((stId) => {
    subjectIds.forEach((subId) => {
      // Liam: high performer, Sophia: top scorer, Noah: struggling
      let score = 85 + Math.floor(Math.random() * 12)
      if (stId === "stu-1") score = subId === "sub-cs10" ? 98 : subId === "sub-math10" ? 94 : 88 + Math.floor(Math.random() * 8)
      if (stId === "stu-2") score = 92 + Math.floor(Math.random() * 7)
      if (stId === "stu-5") score = 58 + Math.floor(Math.random() * 15) // low grade

      const { point, letter } = calculateGrade(score, 100)
      insertGrade.run(
        `gr-${grId++}`,
        stId,
        "exam-mid-2025",
        subId,
        score,
        100,
        point,
        letter,
        score >= 90 ? "Outstanding concept mastery" : score >= 75 ? "Solid performance" : "Requires remedial support"
      )
    })
  })

  // Final scores
  grade10Students.forEach((stId) => {
    subjectIds.forEach((subId) => {
      let score = 86 + Math.floor(Math.random() * 12)
      if (stId === "stu-1") score = subId === "sub-cs10" ? 99 : subId === "sub-math10" ? 96 : 91
      if (stId === "stu-2") score = 95 + Math.floor(Math.random() * 5)
      if (stId === "stu-5") score = 64 + Math.floor(Math.random() * 12)

      const { point, letter } = calculateGrade(score, 100)
      insertGrade.run(
        `gr-${grId++}`,
        stId,
        "exam-fin-2025",
        subId,
        score,
        100,
        point,
        letter,
        "Consolidated semester evaluation"
      )
    })
  })
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
