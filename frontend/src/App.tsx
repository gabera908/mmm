import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/layouts/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Accounts from './pages/Accounts'
import JournalEntries from './pages/JournalEntries'
import AmericanJournal from './pages/AmericanJournal'
import GeneralLedger from './pages/GeneralLedger'
import TrialBalance from './pages/TrialBalance'
import Funds from './pages/Funds'
import Projects from './pages/Projects'
import Donors from './pages/Donors'
import Donations from './pages/Donations'
import Budgets from './pages/Budgets'
import Reports from './pages/Reports'
import CostCenters from './pages/CostCenters'
import SettingsIndex from './pages/settings'
import SettingsUsers from './pages/settings/Users'
import SettingsRoles from './pages/settings/Roles'
import SettingsFiscalYears from './pages/settings/FiscalYears'
import SettingsCurrencies from './pages/settings/Currencies'
import SettingsAuditLogs from './pages/settings/AuditLogs'
import SettingsBackups from './pages/settings/Backups'
import SettingsChangePassword from './pages/settings/ChangePassword'
import SettingsSystem from './pages/settings/SystemManager'
import SettingsGeneral from './pages/settings/GeneralSettings'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  const token = useAuthStore((s) => s.token)

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/change-password" element={<Navigate to="settings/change-password" replace />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="journals" element={<JournalEntries />} />
        <Route path="american-journal" element={<AmericanJournal />} />
        <Route path="ledger" element={<GeneralLedger />} />
        <Route path="trial-balance" element={<TrialBalance />} />
        <Route path="funds" element={<Funds />} />
        <Route path="projects" element={<Projects />} />
        <Route path="donors" element={<Donors />} />
        <Route path="donations" element={<Donations />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="reports" element={<Reports />} />
        <Route path="cost-centers" element={<CostCenters />} />
        <Route path="settings" element={<SettingsIndex />}>
          <Route index element={<Navigate to="general" replace />} />
          <Route path="general" element={<SettingsGeneral />} />
          <Route path="users" element={<SettingsUsers />} />
          <Route path="roles" element={<SettingsRoles />} />
          <Route path="fiscal-years" element={<SettingsFiscalYears />} />
          <Route path="currencies" element={<SettingsCurrencies />} />
          <Route path="audit-logs" element={<SettingsAuditLogs />} />
          <Route path="backups" element={<SettingsBackups />} />
          <Route path="change-password" element={<SettingsChangePassword />} />
          <Route path="system" element={<SettingsSystem />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
