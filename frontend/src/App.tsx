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
import Users from './pages/Users'
import Roles from './pages/Roles'
import FiscalYears from './pages/FiscalYears'
import Currencies from './pages/Currencies'
import AuditLogs from './pages/AuditLogs'
import Backups from './pages/Backups'
import Settings from './pages/Settings'
import CostCenters from './pages/CostCenters'
import ChangePassword from './pages/ChangePassword'

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
      <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
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
        <Route path="users" element={<Users />} />
        <Route path="roles" element={<Roles />} />
        <Route path="fiscal-years" element={<FiscalYears />} />
        <Route path="currencies" element={<Currencies />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="backups" element={<Backups />} />
        <Route path="settings" element={<Settings />} />
        <Route path="cost-centers" element={<CostCenters />} />
      </Route>
    </Routes>
  )
}

export default App
