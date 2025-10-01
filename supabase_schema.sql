-- Supabase database schema for invoice dashboard enhancements

-- Existing invoices table assumed to exist

-- Create users table (even if single user, for future extensibility)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create audit_logs table to track changes to invoices
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES users(id),
  change_type VARCHAR(50) NOT NULL, -- e.g., 'update', 'create', 'delete'
  change_details JSONB,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payment_reminders table for automated reminders
CREATE TABLE IF NOT EXISTS payment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'pending' -- e.g., 'pending', 'sent', 'failed'
);

-- Create reports table to store generated reports metadata
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR(100),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  report_data JSONB
);

-- Create bulk_actions table to track batch operations
CREATE TABLE IF NOT EXISTS bulk_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type VARCHAR(100),
  invoice_ids UUID[],
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status VARCHAR(50) DEFAULT 'pending'
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_invoice_id ON audit_logs(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_invoice_id ON payment_reminders(invoice_id);
