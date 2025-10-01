export const invoiceValidationRules = {
  nip: { required: true, pattern: /^\d{10}$/, message: 'NIP must be 10 digits' },
  firma: { required: true, minLength: 1 },
  numer_faktury: { required: true },
  data_wystawienia: { required: true },
  brutto: { required: true, min: 0 },
  netto: { required: true, min: 0 },
  status: { required: true, oneOf: ['Unpaid', 'Paid', 'Partially Paid'] },
  vat_percentage: { min: 0, max: 100 },
}
