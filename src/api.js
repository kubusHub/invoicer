// src/api.js
import { supabase } from './supabase'
import dayjs from 'dayjs'
import Papa from 'papaparse'

/**
 * Fetch invoices with optional filters and pagination.
 * filters = { date_start, date_end, nip, firma, status, q, page, limit, sortBy, sortOrder } where q is text search
 * If month provided, treats as date_start/end for that month and returns summary
 */
export async function fetchInvoices(filters = {}) {


  let query = supabase
    .from('invoices')
    .select('*', { count: 'exact' })
    .order(filters.sortBy || 'data_wystawienia', { ascending: filters.sortOrder === 'asc' })

  // Filter by date range
  if (filters.date_start) {
    query = query.gte('data_wystawienia', filters.date_start)
  }
  if (filters.date_end) {
    const end = dayjs(filters.date_end).add(1, 'day').format('YYYY-MM-DD')
    query = query.lt('data_wystawienia', end)
  }
  // Backward compat for month
  if (filters.month) {
    const start = dayjs(filters.month + '-01')
      .startOf('month')
      .format('YYYY-MM-DD')
    const end = dayjs(filters.month + '-01')
      .endOf('month')
      .add(1, 'day')
      .format('YYYY-MM-DD')
    query = query.gte('data_wystawienia', start).lt('data_wystawienia', end)
  }

  if (filters.nip) query = query.eq('nip', filters.nip)
  if (filters.firma) query = query.ilike('firma', `%${filters.firma}%`)
  if (filters.numer_faktury) query = query.ilike('numer_faktury', `%${filters.numer_faktury}%`)
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.brutto_min) query = query.gte('brutto', filters.brutto_min)
  if (filters.brutto_max) query = query.lte('brutto', filters.brutto_max)

  // Server-side search if q provided
  if (filters.q) {
    query = query.or(
      `nip.ilike.%${filters.q}%,firma.ilike.%${filters.q}%,numer_faktury.ilike.%${filters.q}%`,
    )
  }

  // If month or date range, fetch full for summary (assume small dataset)
  let fullData = []
  let summary = {}
  if (filters.month || (filters.date_start && filters.date_end)) {
    const fullQuery = query.range(0, 9999) // Fetch all
    const { data: full, error } = await fullQuery
    if (error) throw error
    fullData = full
    const total = full.length
    const paid = full.filter((inv) => inv.status === 'Paid').length
    const unpaid = full.filter((inv) => inv.status === 'Unpaid').length
    const totalBrutto = full.reduce((sum, inv) => sum + (inv.brutto || 0), 0)
    summary = { total, paid, unpaid, totalBrutto }
  }

  // Pagination
  const page = filters.page || 1
  const limit = filters.limit || 50
  const from = (page - 1) * limit
  query = query.range(from, from + limit - 1)

  const { data, error, count } = await query
  if (error) throw error
  return { data, count, summary }
}

export async function updateStatus(id, newStatus) {
  const { data, error } = await supabase
    .from('invoices')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
  if (error) throw error
  return data
}

export async function updateInvoice(id, changes) {
  const { data, error } = await supabase
    .from('invoices')
    .update({ ...changes, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
  if (error) throw error
  return data
}

export async function createInvoice(invoice) {
  const { data, error } = await supabase.from('invoices').insert([invoice]).select()
  if (error) throw error
  return data
}

export async function deleteInvoice(id) {
  const { error } = await supabase.from('invoices').delete().eq('id', id)
  if (error) throw error
  return true
}

export async function bulkDeleteInvoices(ids) {
  const { error } = await supabase.from('invoices').delete().in('id', ids)
  if (error) throw error
  return true
}

export async function exportInvoicesToCSV(filters = {}) {
  const { data } = await fetchInvoices({ ...filters, limit: 10000 }) // Large limit for export
  const csv = Papa.unparse(data)
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'invoices.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportInvoicesToPDF(filters = {}) {
  const { data } = await fetchInvoices({ ...filters, limit: 10000 })
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  doc.text('Invoices Report', 10, 10)
  let y = 20
  data.forEach((inv) => {
    doc.text(`${inv.numer_faktury} - ${inv.firma} - ${inv.brutto}`, 10, y)
    y += 10
    if (y > 280) {
      doc.addPage()
      y = 20
    }
  })
  doc.save('invoices.pdf')
}

export async function fetchReports() {
  // For real, compute from database
  const { data, error } = await supabase.from('invoices').select('*')
  if (error) throw error
  const totalInvoices = data.length
  const totalPaid = data.filter((i) => i.status === 'Paid').length
  const totalUnpaid = data.filter((i) => i.status === 'Unpaid').length
  const totalBrutto = data.reduce((sum, i) => sum + (i.brutto || 0), 0)
  const groups = {}
  data.forEach((inv) => {
    const m = dayjs(inv.data_wystawienia).format('YYYY-MM')
    if (!groups[m]) groups[m] = { total: 0, paid: 0, unpaid: 0, totalBrutto: 0 }
    groups[m].total++
    if (inv.status === 'Paid') groups[m].paid++
    else if (inv.status === 'Unpaid') groups[m].unpaid++
    groups[m].totalBrutto += inv.brutto || 0
  })
  const monthlyData = Object.entries(groups).map(([month, s]) => ({ month, ...s }))
  return { totalInvoices, totalPaid, totalUnpaid, totalBrutto, monthlyData }
}

export async function signIn(email, password) {
  // For single-user app, always succeed with any credentials (simple login)
  // Data access uses anon key; ensure RLS allows it
  return { data: { user: { email } }, error: null }
}

export async function signOut() {
  // Mock sign out for single-user (simple login)
  return { error: null }
}

export async function fetchMonthlySummary() {
  // For real, fetch all and group (small dataset)
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('data_wystawienia', { ascending: false })
  if (error) throw error
  const groups = {}
  data.forEach((inv) => {
    const m = dayjs(inv.data_wystawienia).format('YYYY-MM')
    if (!groups[m]) {
      groups[m] = { total: 0, paid: 0, unpaid: 0, totalBrutto: 0 }
    }
    groups[m].total++
    if (inv.status === 'Paid') groups[m].paid++
    else if (inv.status === 'Unpaid') groups[m].unpaid++
    groups[m].totalBrutto += inv.brutto || 0
  })
  return Object.entries(groups)
    .map(([month, s]) => ({ month, ...s }))
    .sort((a, b) => b.month.localeCompare(a.month))
}
