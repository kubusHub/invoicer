export interface Invoice {
  id: number
  nip: string
  firma: string
  numer_faktury: string
  data_wystawienia: string // date
  brutto: number
  netto: number
  tytul_przelewu?: string
  numer_rachunku?: string
  status: string
  webview_link?: string
  download_link?: string
  file_id?: string
  created_at?: string
  updated_at?: string
  vat_percentage?: number
  vat_value?: number
}
