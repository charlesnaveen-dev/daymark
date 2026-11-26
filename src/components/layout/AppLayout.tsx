import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  BookOpenCheck,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock,
  History,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { TimeEntryModal } from '../tracker/TimeEntryModal';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tracker', label: 'Time Tracker', icon: Clock },
  { to: '/schedule', label: 'My Schedule', icon: CalendarClock },
  { to: '/review', label: 'Daily Review', icon: BookOpenCheck },
  { to: '/history', label: 'History', icon: History },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const MOBILE_NAV_ITEMS = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/tracker', label: 'Track', icon: Clock },
  { to: '/schedule', label: 'Schedule', icon: CalendarClock },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/history', label: 'History', icon: History },
];

export function AppLayout() {
  const { user, isCloudMode, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] lg:flex">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 76 : 248 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="no-print sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-card)] lg:flex"
      >
        <div className="flex h-16 items-center justify-between px-4">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-primary)] text-sm font-bold text-white">
                D
              </div>
              <span className="text-base font-semibold tracking-tight">
                DAYMARK
              </span>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-primary)] text-sm font-bold text-white">
              D
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="rounded-lg p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={() => setQuickLogOpen(true)}
            className={`flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-primary)] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-primary-hover)] ${
              collapsed ? 'px-0' : 'px-3'
            }`}
            title="Log Time"
          >
            <Plus className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Log Time</span>}
          </button>
        </div>

        <nav aria-label="Main navigation" className="flex-1 space-y-1 px-3 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--accent-soft)] text-[var(--accent-soft-text)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
                  } ${collapsed ? 'justify-center px-0' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-[var(--border-subtle)] p-3">
          {!collapsed && (
            <div className="mb-2.5 flex items-center justify-between rounded-xl bg-[var(--bg-subtle)] px-3 py-2 text-xs">
              <span className="truncate font-medium text-[var(--text-secondary)]">
                {isCloudMode ? 'Supabase Cloud' : 'Local Dev Mode'}
              </span>
              <span
                className={`h-2 w-2 rounded-full ${
                  isCloudMode ? 'bg-[var(--success)]' : 'bg-[var(--warning)]'
                }`}
              />
            </div>
          )}
          <div
            className={`flex items-center ${
              collapsed ? 'justify-center' : 'justify-between px-1'
            }`}
          >
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                  {user?.displayName ?? 'Creator'}
                </p>
                <p className="truncate text-xs text-[var(--text-secondary)]">
                  {user?.email}
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={signOut}
              aria-label="Sign out"
              title="Sign out"
              className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--danger)]"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Top Header */}
      <header className="no-print sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/95 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-primary)] text-xs font-bold text-white">
            D
          </div>
          <span className="text-sm font-semibold tracking-tight">DAYMARK</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuickLogOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-primary)] px-3 py-1.5 text-xs font-medium text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Log</span>
          </button>
          <NavLink
            to="/settings"
            aria-label="Settings"
            className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
          >
            <Settings className="h-4 w-4" />
          </NavLink>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-w-0 flex-1 pb-24 lg:pb-10">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Mobile navigation"
        className="no-print fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-[var(--border-subtle)] bg-[var(--bg-card)]/95 px-2 py-1.5 backdrop-blur lg:hidden"
      >
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'text-[var(--accent-primary)]'
                    : 'text-[var(--text-secondary)]'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <TimeEntryModal
        open={quickLogOpen}
        onClose={() => setQuickLogOpen(false)}
      />
    </div>
  );
}
