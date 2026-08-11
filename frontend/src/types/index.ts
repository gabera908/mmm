export interface User {
  id: number
  username: string
  email: string
  full_name: string
  role_id: number
  is_active: boolean
  is_superuser: boolean
  must_change_password: boolean
  role?: {
    id: number
    name: string
    permissions: string
  }
}

export interface Role {
  id: number
  name: string
  description: string
  permissions: string
  is_active: boolean
}

export interface Account {
  id: number
  code: string
  name: string
  name_en: string
  parent_id: number | null
  account_type_id: number
  level: number
  is_active: boolean
  is_header: boolean
  description: string
}

export interface Fund {
  id: number
  code: string
  name: string
  fund_type: string
  description: string
  is_active: boolean
}

export interface Donor {
  id: number
  name: string
  donor_type: string
  phone: string
  email: string
  address: string
  notes: string
  is_active: boolean
}

export interface Project {
  id: number
  code: string
  name: string
  description: string
  fund_id: number
  donor_id: number
  budget: number
  start_date: string
  end_date: string
  status: string
}

export interface JournalEntry {
  id: number
  entry_number: string
  entry_date: string
  description: string
  reference: string
  status: string
  currency: string
  exchange_rate: number
  fund_id: number
  project_id: number
  lines: JournalEntryLine[]
  created_at: string
}

export interface JournalEntryLine {
  id: number
  account_id: number
  fund_id: number
  project_id: number
  debit: number
  credit: number
  description: string
  line_number: number
}

export interface Budget {
  id: number
  fiscal_year: number
  account_id: number
  fund_id: number
  project_id: number
  budget_amount: number
  actual_amount: number
  notes: string
}

export interface Donation {
  id: number
  donation_date: string
  donor_id: number
  fund_id: number
  project_id: number
  amount: number
  currency: string
  payment_method: string
  reference: string
  notes: string
}

export interface Currency {
  id: number
  code: string
  name: string
  symbol: string
  is_base: boolean
  is_active: boolean
}

export interface FiscalYear {
  id: number
  year: number
  start_date: string
  end_date: string
  is_closed: boolean
  periods: AccountingPeriod[]
}

export interface AccountingPeriod {
  id: number
  fiscal_year_id: number
  name: string
  start_date: string
  end_date: string
  is_closed: boolean
}

export interface AuditLog {
  id: number
  user_id: number
  action: string
  table_name: string
  record_id: number
  old_value: string
  new_value: string
  ip_address: string
  created_at: string
}

export interface BackupRecord {
  id: number
  filename: string
  file_path: string
  file_size: number
  backup_type: string
  created_at: string
}
