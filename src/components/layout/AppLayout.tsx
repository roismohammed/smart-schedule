import React, { useState } from 'react'
import {
  LayoutDashboard,
  CalendarDays,
  Calendar,
  Users,
  Bot,
  Settings,
  Bell,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
  Plus,
  MessageSquare,
  CheckCircle2
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ToastContainer, toast } from '@/components/ui/Toast'

export type NavTab = 'dashboard' | 'schedules' | 'calendar' | 'pj' | 'assistant' | 'settings'

interface AppLayoutProps {
  currentTab: NavTab
  setCurrentTab: (tab: NavTab) => void
  children: React.ReactNode
  onOpenAddSchedule?: () => void
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  setCurrentTab,
  children,
  onOpenAddSchedule
}) => {
  const { isDarkMode, toggleDarkMode, currentUser, setCurrentUser, reminders, markReminderSent, orgName } = useAppStore()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const pendingReminders = reminders.filter((r) => r.status === 'pending')

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'schedules', label: 'Schedules', icon: CalendarDays },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'pj', label: 'Team & PJ', icon: Users },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const handleNavClick = (tab: NavTab) => {
    setCurrentTab(tab)
    setIsMobileMenuOpen(false)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    toast.info('Signed out')
  }

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors w-full">
      <ToastContainer />

      {/* Sidebar Desktop */}
      <aside
        className={`hidden lg:flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 h-screen transition-all duration-200 z-20 justify-between shrink-0 ${
          isSidebarCollapsed ? 'w-16 p-3' : 'w-56 p-4'
        }`}
      >
        <div className="space-y-4">
          {/* Logo & Toggle Header */}
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-1'}`}>
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-6 h-6 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs shrink-0">
                  P
                </div>
                <div className="overflow-hidden">
                  <span className="font-semibold text-xs tracking-tight text-zinc-900 dark:text-zinc-100 block truncate">
                    PiketAI
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>

          {/* Quick Create Action */}
          {onOpenAddSchedule && (
            <Button
              onClick={onOpenAddSchedule}
              size={isSidebarCollapsed ? 'icon' : 'sm'}
              className="w-full justify-center"
            >
              <Plus className="w-4 h-4" />
              {!isSidebarCollapsed && <span>New Schedule</span>}
            </Button>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentTab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id as NavTab)}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-lg text-xs font-medium transition-colors ${
                    isSidebarCollapsed ? 'justify-center p-2' : 'gap-2 px-2.5 py-1.5'
                  } ${
                    isActive
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                      : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`} />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </button>
              )
            })}
          </nav>
        </div>

        {/* User Card & Settings */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
          {!isSidebarCollapsed && (
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-medium text-zinc-400">Theme</span>
              <button
                onClick={toggleDarkMode}
                className="p-1 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5 text-zinc-300" /> : <Moon className="w-3.5 h-3.5 text-zinc-600" />}
              </button>
            </div>
          )}

          {currentUser ? (
            <div className={`flex items-center rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 ${
              isSidebarCollapsed ? 'justify-center p-1.5' : 'gap-2 p-1.5'
            }`}>
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-md object-cover"
              />
              {!isSidebarCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[9px] text-zinc-400 capitalize">{currentUser.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 p-1"
                    title="Sign out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          ) : null}
        </div>
      </aside>

      {/* Main Content Area (Edge-to-Edge Full Width) */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Menu className="w-4 h-4" />
            </button>
            <h1 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 capitalize">
              {navItems.find((n) => n.id === currentTab)?.label || 'Overview'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark mode button on desktop navbar as well */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="p-1.5 w-7 h-7 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-zinc-300" /> : <Moon className="w-3.5 h-3.5 text-zinc-600" />}
            </Button>

            {/* Notification Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <Bell className="w-4 h-4" />
                {pendingReminders.length > 0 && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-4 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs font-semibold">WhatsApp Automation Log</span>
                    <Badge variant="outline">{pendingReminders.length} Pending</Badge>
                  </div>

                  <div className="py-2 divide-y divide-zinc-100 dark:divide-zinc-800 max-h-72 overflow-y-auto">
                    {reminders.length === 0 ? (
                      <p className="text-xs text-zinc-400 py-4 text-center">No active reminders</p>
                    ) : (
                      reminders.map((r) => (
                        <div key={r.id} className="py-2.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[200px]">
                              {r.schedule_title}
                            </span>
                            <Badge variant={r.status === 'sent' ? 'success' : 'warning'}>
                              {r.status === 'sent' ? 'Sent' : 'Pending'}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                            {r.message_preview}
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-zinc-400">{r.target}</span>
                            {r.status === 'pending' && (
                              <button
                                onClick={() => {
                                  markReminderSent(r.id)
                                  toast.success('WhatsApp Sent', `Reminder sent for "${r.schedule_title}"`)
                                }}
                                className="text-[11px] font-medium text-zinc-900 dark:text-zinc-100 hover:underline flex items-center gap-1"
                              >
                                Send now
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Container (Full width without excessive margins) */}
        <main className="flex-1 p-4 sm:p-6 w-full">{children}</main>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-zinc-900/40 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-zinc-900 p-5 flex flex-col justify-between shadow-xl animate-in slide-in-from-left">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs">
                    P
                  </div>
                  <span className="font-semibold text-sm">PiketAI</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-md text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {onOpenAddSchedule && (
                <Button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    onOpenAddSchedule()
                  }}
                  size="sm"
                  className="w-full justify-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Schedule</span>
                </Button>
              )}

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = currentTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id as NavTab)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                        isActive
                          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 font-semibold'
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
