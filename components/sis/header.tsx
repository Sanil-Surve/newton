"use client"

import React, { useEffect, useRef, useState } from "react"
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Command,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Shield,
  Sun,
  User,
  UserCheck,
  Users,
  X,
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
    name: "Ramesh Sharma",
    role: "student",
    email: "ramesh.sharma@student.newtonsis.edu",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
    title: "Grade 10-A • Roll No. STU-2025-001",
  },
  parent: {
    id: "usr-par-1",
    name: "Sanjay & Sunita Sharma",
    role: "parent",
    email: "sanjay.sharma@family.com",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150",
    title: "Guardian of Ramesh Sharma (Grade 10-A)",
  },
}

interface HeaderProps {
  currentRole: UserRole
  onRoleChange: (role: UserRole) => void
  activeTab: string
  onTabChange: (tab: string) => void
  globalSearch: string
  onSearchChange: (val: string) => void
  students?: any[]
  onSelectStudent?: (studentId: string) => void
}

export function SISHeader({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  globalSearch,
  onSearchChange,
  students = [],
  onSelectStudent,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const currentUser = DEMO_USERS[currentRole]

  // Keyboard shortcut listener for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        searchInputRef.current?.focus()
        setIsSearchFocused(true)
      } else if (e.key === "Escape") {
        setIsSearchFocused(false)
        setShowNotifications(false)
        setShowUserMenu(false)
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filter students for search suggestions
  const searchResults =
    globalSearch.trim().length > 0
      ? students
        .filter((s) => {
          const q = globalSearch.toLowerCase()
          return (
            s.first_name?.toLowerCase().includes(q) ||
            s.last_name?.toLowerCase().includes(q) ||
            s.roll_no?.toLowerCase().includes(q) ||
            s.grade?.toLowerCase().includes(q) ||
            s.guardian_name?.toLowerCase().includes(q)
          )
        })
        .slice(0, 5)
      : []

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "students", label: "Students", icon: Users },
    { id: "courses", label: "Classes", icon: BookOpen },
    { id: "timetable", label: "Timetable", icon: Calendar },
    { id: "attendance", label: "Attendance", icon: UserCheck },
    { id: "grades", label: "Grades & Exams", icon: GraduationCap },
  ]

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId)
    setMobileMenuOpen(false)
  }

  const handleRoleSelect = (role: UserRole) => {
    onRoleChange(role)
    setShowUserMenu(false)
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Branding & Desktop Nav */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => handleNavClick("dashboard")}
            className="group flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-foreground text-background shadow-xs transition-transform duration-200 group-hover:scale-105">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-foreground text-base tracking-tight font-heading">
                  Newton
                </span>
                <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-mono font-medium text-foreground">
                  v3.0
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-medium">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${isActive
                    ? "bg-muted text-foreground font-semibold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                >
                  <Icon className={`size-3.5 ${isActive ? "text-foreground" : "text-muted-foreground"}`} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Right: Search, Role Switcher, Notifications, Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search with Live Results Popover */}
          <div ref={searchContainerRef} className="relative hidden md:block w-44 lg:w-60">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search students, roll no..."
              value={globalSearch}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                onSearchChange(e.target.value)
                setIsSearchFocused(true)
              }}
              className="h-8 w-full rounded-lg border border-border bg-muted/40 pl-8 pr-9 text-xs text-foreground placeholder:text-muted-foreground transition-all focus:border-ring focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded border border-border/80 bg-background/80 px-1 py-0.5 text-[9px] font-mono text-muted-foreground">
              <Command className="size-2.5" />
              <span>K</span>
            </div>

            {/* Live Search Autocomplete Popover */}
            {isSearchFocused && globalSearch.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-border bg-card p-2 shadow-xl animate-in fade-in-50 duration-100 min-w-[280px]">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Matching Students ({searchResults.length})
                </div>
                {searchResults.length > 0 ? (
                  <div className="mt-1 space-y-1">
                    {searchResults.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          if (onSelectStudent) onSelectStudent(s.id)
                          setIsSearchFocused(false)
                        }}
                        className="flex items-center justify-between rounded-lg p-2 text-xs transition-colors hover:bg-muted cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-6 ring-1 ring-border">
                            <AvatarImage src={s.photo_url} alt={s.first_name} />
                            <AvatarFallback className="text-[10px]">
                              {s.first_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground text-xs leading-none">
                              {s.first_name} {s.last_name}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                              {s.roll_no} • {s.grade}-{s.section}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {s.current_gpa || "3.6"} GPA
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                    No matching students found for &ldquo;{globalSearch}&rdquo;.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Role Switcher Pill for Desktop */}
          <div className="hidden sm:flex items-center rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
            <span className="px-2 text-[10px] uppercase font-semibold text-muted-foreground">
              Role:
            </span>
            {(["admin", "teacher", "student", "parent"] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => handleRoleSelect(r)}
                className={`rounded-md px-2 py-1 text-[11px] font-medium capitalize transition-all ${currentRole === r
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Notifications Trigger */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowUserMenu(false)
              }}
              className="relative size-8 text-muted-foreground hover:text-foreground"
              title="System Notifications"
            >
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-amber-500 ring-2 ring-background" />
            </Button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-card p-3 shadow-xl z-50 animate-in fade-in-50 duration-100 text-xs">
                <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-2">
                  <span className="font-semibold text-foreground">
                    Institutional Alerts
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    2 New
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 rounded-lg bg-amber-500/10 p-2 text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[11px]">
                        Low Attendance Warning
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Vaibhav Joshi attendance dropped to 60.0%. Parent notice triggered.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-lg bg-muted/40 p-2">
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[11px] text-foreground">
                        Term 1 Grades Synchronized
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Grade 10-A Final evaluation GPA computed in SQLite.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar with Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu)
                setShowNotifications(false)
              }}
              className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-muted/50 focus:outline-none"
            >
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
              <ChevronDown className="hidden xl:block size-3 text-muted-foreground" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-card p-3 shadow-xl z-50 animate-in fade-in-50 duration-100 text-xs">
                <div className="border-b border-border/50 pb-2 mb-2">
                  <p className="font-bold text-foreground">{currentUser.name}</p>
                  <p className="text-[10px] text-muted-foreground">{currentUser.email}</p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{currentUser.title}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                    Switch Role Persona
                  </p>
                  {(["admin", "teacher", "student", "parent"] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleSelect(r)}
                      className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs capitalize transition-colors ${currentRole === r
                        ? "bg-muted text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        }`}
                    >
                      <span>{r} View</span>
                      {currentRole === r && (
                        <CheckCircle2 className="size-3 text-foreground" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden size-8 text-foreground"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {/* Expandable Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border/80 bg-background px-4 py-4 space-y-4 animate-in slide-in-from-top-2 duration-150 shadow-lg">
          {/* Mobile Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search students, roll no..."
              value={globalSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 w-full rounded-lg border border-border bg-muted/40 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-background focus:outline-none"
            />
          </div>

          {/* Mobile Nav Links */}
          <div className="grid grid-cols-2 gap-1.5 text-xs font-medium">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 rounded-lg p-2.5 transition-all text-left ${isActive
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* Mobile Role Switcher */}
          <div className="border-t border-border/60 pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Select Demo Role Persona:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["admin", "teacher", "student", "parent"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleSelect(r)}
                  className={`flex items-center justify-between rounded-lg border p-2 text-xs capitalize transition-all ${currentRole === r
                    ? "border-foreground bg-muted font-bold text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <span>{r}</span>
                  {currentRole === r && (
                    <CheckCircle2 className="size-3.5 text-foreground" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
