<template>
  <div>
    <h2>Create Invoice</h2>
    <form @submit.prevent="save">
      <div>
        <label>NIP</label>
        <input v-model="invoice.nip" required />
        <span v-if="errors.nip">{{ errors.nip }}</span>
      </div>
      <div>
        <label>Firma</label>
        <input v-model="invoice.firma" required />
        <span v-if="errors.firma">{{ errors.firma }}</span>
      </div>
      <div>
        <label>Numer Faktury</label>
        <input v-model="invoice.numer_faktury" required />
      </div>
      <div>
        <label>Data Wystawienia</label>
        <input v-model="invoice.data_wystawienia" type="date" required />
      </div>
      <div>
        <label>Netto</label>
        <input v-model.number="invoice.netto" type="number" step="0.01" required />
      </div>
      <div>
        <label>VAT %</label>
        <input v-model.number="invoice.vat_percentage" type="number" step="0.01" />
      </div>
      <div>
        <label>Brutto</label>
        <input v-model.number="invoice.brutto" type="number" step="0.01" required />
      </div>
      <div>
        <label>Status</label>
        <select v-model="invoice.status" required>
          <option>Unpaid</option>
          <option>Paid</option>
          <option>Partially Paid</option>
        </select>
      </div>
      <div>
        <label>Tytul Przelewu</label>
        <input v-model="invoice.tytul_przelewu" />
      </div>
      <div>
        <label>Numer Rachunku</label>
        <input v-model="invoice.numer_rachunku" />
      </div>
      <div>
        <label>Webview Link</label>
        <input v-model="invoice.webview_link" />
      </div>
      <div>
        <label>Download Link</label>
        <input v-model="invoice.download_link" />
      </div>
      <div style="margin-top: 8px">
        <button type="submit">Save</button>
        <button type="button" @click="saveDraft">Save Draft</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createInvoice } from '../api'
import { invoiceValidationRules } from '../utils/validation'

const router = useRouter()

const invoice = ref({
  nip: '',
  firma: '',
  numer_faktury: '',
  data_wystawienia: '',
  netto: null,
  vat_percentage: null,
  brutto: null,
  status: 'Unpaid',
  tytul_przelewu: '',
  numer_rachunku: '',
  webview_link: '',
  download_link: '',
  draft: false,
})

const errors = ref({})

function validate() {
  errors.value = {}
  for (const [field, rules] of Object.entries(invoiceValidationRules)) {
    const value = invoice.value[field]
    if (rules.required && (!value || value === '')) {
      errors.value[field] = `${field} is required`
    } else if (rules.pattern && !rules.pattern.test(value)) {
      errors.value[field] = rules.message || `${field} is invalid`
    } else if (rules.min !== undefined && value < rules.min) {
      errors.value[field] = `${field} must be at least ${rules.min}`
    } else if (rules.max !== undefined && value > rules.max) {
      errors.value[field] = `${field} must be at most ${rules.max}`
    }
  }
  return Object.keys(errors.value).length === 0
}

async function save() {
  if (!validate()) return
  try {
    invoice.value.draft = false
    await createInvoice(invoice.value)
    alert('Invoice created')
    router.push('/')
  } catch (e) {
    alert('Save failed: ' + e.message)
  }
}

async function saveDraft() {
  try {
    invoice.value.draft = true
    await createInvoice(invoice.value)
    alert('Draft saved')
    router.push('/')
  } catch (e) {
    alert('Save failed: ' + e.message)
  }
}
</script>
