"use client"

import React from "react"
import {
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Moon,
  Search,
  Shield,
  Sun,
  UserCheck,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export type UserRole = "admin" | "teacher" | "student" | "parent"

export interface CurrentUser {
  id: string
  name: string
  role: UserRole
  email: string
  avatar: string
  title: string
}

export const DEMO_USERS: Record<UserRole, CurrentUser> = {
  admin: {
    id: "usr-admin-1",
    name: "Eleanor Campbell",
    role: "admin",
    email: "admin@newtonsis.edu",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    title: "Principal & Head of School",
  },
  teacher: {
    id: "usr-tea-1",
    name: "Dr. Marcus Vance",
    role: "teacher",
    email: "m.vance@newtonsis.edu",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    title: "Head of Mathematics • Grade 10-A Mentor",
  },
  student: {
    id: "stu-1",
    name: "Liam Alexander Chen",
    role: "student",
    email: "liam.chen@student.newtonsis.edu",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
    title: "Grade 10-A • Roll No. STU-2025-001",
  },
  parent: {
    id: "usr-par-1",
    name: "Robert & Mei Chen",
    role: "parent",
    email: "robert.chen@family.com",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150",
    title: "Guardian of Liam Chen (Grade 10-A)",
  },
}

interface HeaderProps {
  currentRole: UserRole
  onRoleChange: (role: UserRole) => void
  activeTab: string
  onTabChange: (tab: string) => void
  globalSearch: string
  onSearchChange: (val: string) => void
}

export function SISHeader({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  globalSearch,
  onSearchChange,
}: HeaderProps) {
  const currentUser = DEMO_USERS[currentRole]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Branding & Role Pills */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => onTabChange("dashboard")}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-foreground text-background shadow-xs font-semibold">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-foreground text-base tracking-tight font-heading">
                  Newton SIS
                </span>
                <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-mono font-medium text-foreground">
                  v3.0
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                Student Management &amp; Academic Intelligence
              </p>
            </div>
          </div>

          {/* Navigation Bar for Desktop */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-medium">
            <button
              onClick={() => onTabChange("dashboard")}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                activeTab === "dashboard"
                  ? "bg-muted text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onTabChange("students")}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                activeTab === "students"
                  ? "bg-muted text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Students
            </button>
            <button
              onClick={() => onTabChange("courses")}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                activeTab === "courses"
                  ? "bg-muted text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Courses &amp; Classes
            </button>
            <button
              onClick={() => onTabChange("timetable")}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                activeTab === "timetable"
                  ? "bg-muted text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Timetable
            </button>
            <button
              onClick={() => onTabChange("attendance")}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                activeTab === "attendance"
                  ? "bg-muted text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Attendance
            </button>
            <button
              onClick={() => onTabChange("grades")}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                activeTab === "grades"
                  ? "bg-muted text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Grades &amp; Exams
            </button>
          </nav>
        </div>

        {/* Right: Search, Role Switcher & Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative hidden md:block w-48 lg:w-60">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search students, roll no..."
              value={globalSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 w-full rounded-lg border border-border bg-muted/30 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Role Switcher Pill */}
          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
            <span className="px-2 text-[10px] uppercase font-semibold text-muted-foreground hidden sm:inline">
              Role:
            </span>
            {(["admin", "teacher", "student", "parent"] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => onRoleChange(r)}
                className={`rounded-md px-2 py-1 text-[11px] font-medium capitalize transition-all ${
                  currentRole === r
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* User Profile Avatar with Role Tag */}
          <div className="flex items-center gap-2.5 pl-1">
            <Avatar className="size-8 ring-1 ring-border">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback className="text-xs bg-muted font-medium">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-semibold text-foreground leading-none">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-muted-foreground capitalize mt-0.5">
                {currentUser.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
