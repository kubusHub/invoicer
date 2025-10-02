<!-- src/components/InvoiceEdit.vue -->
<template>
  <div class="container mt-4">
    <div class="mb-3">
      <button class="btn btn-secondary" @click="$router.push('/')">
        <i class="bi bi-arrow-left"></i> Back
      </button>
    </div>
    <h2 class="mb-4">Edit Invoice</h2>
    <form @submit.prevent="save" v-if="invoice" class="row g-3">
      <div class="col-md-6">
        <label for="nip" class="form-label">NIP</label>
        <input id="nip" v-model="invoice.nip" class="form-control" required />
        <div v-if="errors.nip" class="text-danger">{{ errors.nip }}</div>
      </div>
      <div class="col-md-6">
        <label for="firma" class="form-label">Firma</label>
        <input id="firma" v-model="invoice.firma" class="form-control" required />
        <div v-if="errors.firma" class="text-danger">{{ errors.firma }}</div>
      </div>
      <div class="col-md-6">
        <label for="numer_faktury" class="form-label">Numer Faktury</label>
        <input id="numer_faktury" v-model="invoice.numer_faktury" class="form-control" required />
      </div>
      <div class="col-md-6">
        <label for="data_wystawienia" class="form-label">Data Wystawienia</label>
        <input
          id="data_wystawienia"
          v-model="invoice.data_wystawienia"
          type="date"
          class="form-control"
          required
        />
      </div>
      <div class="col-md-4">
        <label for="netto" class="form-label">Netto</label>
        <input
          id="netto"
          v-model.number="invoice.netto"
          type="number"
          step="0.01"
          class="form-control"
          required
        />
      </div>
      <div class="col-md-4">
        <label for="vat_percentage" class="form-label">VAT %</label>
        <input
          id="vat_percentage"
          v-model.number="invoice.vat_percentage"
          type="number"
          step="0.01"
          class="form-control"
        />
      </div>
      <div class="col-md-4">
        <label for="brutto" class="form-label">Brutto</label>
        <input
          id="brutto"
          v-model.number="invoice.brutto"
          type="number"
          step="0.01"
          class="form-control"
          required
        />
      </div>
      <div class="col-md-6">
        <label for="status" class="form-label">Status</label>
        <select id="status" v-model="invoice.status" class="form-select" required>
          <option>Unpaid</option>
          <option>Paid</option>
          <option>Partially Paid</option>
        </select>
      </div>
      <div class="col-md-6">
        <label for="tytul_przelewu" class="form-label">Tytul Przelewu</label>
        <input id="tytul_przelewu" v-model="invoice.tytul_przelewu" class="form-control" />
      </div>
      <div class="col-md-6">
        <label for="numer_rachunku" class="form-label">Numer Rachunku</label>
        <input id="numer_rachunku" v-model="invoice.numer_rachunku" class="form-control" />
      </div>
      <div class="col-md-6">
        <label for="file_id" class="form-label">File ID</label>
        <input id="file_id" v-model="invoice.file_id" class="form-control" />
      </div>
      <div class="col-12 mt-4">
        <button type="submit" class="btn btn-primary me-2">Save</button>
        <a
          v-if="invoice.webview_link"
          :href="invoice.webview_link"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-outline-info me-2"
        >
          <i class="bi bi-eye"></i> View
        </a>
        <a
          v-if="invoice.download_link"
          :href="invoice.download_link"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-outline-success"
        >
          <i class="bi bi-download"></i> Download
        </a>
      </div>
    </form>
    <div v-else class="text-center mt-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading invoice...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { updateInvoice } from '../api'
import { invoiceValidationRules } from '../utils/validation'

const route = useRoute()
const router = useRouter()
const invoice = ref(null)
const errors = ref({})

async function load() {
  const id = route.params.id
  const { data, error } = await supabase.from('invoices').select('*').eq('id', id).single()
  if (error) {
    alert(error.message)
    return
  }
  invoice.value = data
}

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
    await updateInvoice(invoice.value.id, invoice.value)
    alert('Saved')
    router.push('/')
  } catch (e) {
    alert('Save failed: ' + e.message)
  }
}

onMounted(load)
</script>
