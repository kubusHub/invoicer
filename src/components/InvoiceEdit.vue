<!-- src/components/InvoiceEdit.vue -->
<template>
  <div>
    <div class="mb-3">
      <button class="btn btn-secondary" @click="$router.push('/')">
        <i class="bi bi-arrow-left"></i>
      </button>
    </div>
    <h2>Edit Invoice</h2>
    <form @submit.prevent="save" v-if="invoice">
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
        <label>File ID</label>
        <input v-model="invoice.file_id" />
      </div>
      <div style="margin-top: 8px">
        <button type="submit">Save</button>
        <a :href="invoice.webview_link" target="_blank" rel="noopener noreferrer"
          ><i class="bi bi-eye"></i
        ></a>
        <a :href="invoice.download_link" target="_blank" rel="noopener noreferrer"
          ><i class="bi bi-download"></i
        ></a>
      </div>
    </form>
    <div v-else>Loading...</div>
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
