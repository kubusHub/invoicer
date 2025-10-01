<template>
  <div class="table-container">
    <table class="responsive-table">
      <thead>
        <tr>
          <th>NIP</th>
          <th>Firma</th>
          <th>Numer</th>
          <th>Data</th>
          <th>Netto</th>
          <th>VAT%</th>
          <th>Brutto</th>
          <th>Status</th>
          <th>Preview</th>
          <th>Download</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="inv in invoices" :key="inv.id">
          <td
            v-if="editing[inv.id]"
            contenteditable
            @blur="updateField(inv, 'nip', $event.target.textContent)"
          >
            {{ inv.nip }}
          </td>
          <td v-else @dblclick="startEdit(inv, 'nip')">{{ inv.nip }}</td>
          <td
            v-if="editing[inv.id]"
            contenteditable
            @blur="updateField(inv, 'firma', $event.target.textContent)"
          >
            {{ inv.firma }}
          </td>
          <td v-else @dblclick="startEdit(inv, 'firma')">{{ inv.firma }}</td>
          <td>{{ inv.numer_faktury }}</td>
          <td>{{ inv.data_wystawienia }}</td>
          <td>{{ format(inv.netto) }}</td>
          <td>{{ inv.vat_percentage }}</td>
          <td>{{ format(inv.brutto) }}</td>
          <td>
            <select v-model="inv.status" @change="onStatusChange(inv)">
              <option>Unpaid</option>
              <option>Paid</option>
              <option>Partially Paid</option>
            </select>
          </td>
          <td>
            <a :href="inv.webview_link" target="_blank" rel="noopener noreferrer"
              ><i class="bi bi-eye"></i
            ></a>
          </td>
          <td>
            <a :href="inv.download_link" target="_blank" rel="noopener noreferrer"
              ><i class="bi bi-download"></i
            ></a>
          </td>
          <td>
            <router-link :to="`/invoice/${inv.id}`"><i class="bi bi-pencil"></i></router-link>
            <button
              class="btn btn-danger btn-sm ms-2"
              @click="deleteInvoiceById(inv.id)"
              title="Delete"
            >
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, computed } from 'vue'
import { updateStatus, updateInvoice, deleteInvoice as apiDeleteInvoice } from '../api'

const props = defineProps({ invoices: Array })
const emit = defineEmits(['refresh'])

const editing = ref({})
const sortField = ref('data_wystawienia')
const sortOrder = ref('desc')
const selected = ref([])

const isAllSelected = computed(() => {
  return props.invoices.length > 0 && selected.value.length === props.invoices.length
})

function format(val) {
  if (val == null) return ''
  return Number(val).toFixed(2)
}

function sortBy(field) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
  // Note: Sorting is handled in fetchInvoices
}

function startEdit(inv, field) {
  editing.value[inv.id] = true
}

async function updateField(inv, field, value) {
  try {
    await updateInvoice(inv.id, { [field]: value })
    inv[field] = value
    delete editing.value[inv.id]
    emit('refresh')
  } catch (e) {
    alert('Failed to update: ' + e.message)
  }
}

async function onStatusChange(inv) {
  try {
    await updateStatus(inv.id, inv.status)
    emit('refresh')
  } catch (e) {
    alert('Failed to update status: ' + e.message)
  }
}

async function deleteInvoiceById(id) {
  if (!confirm('Are you sure you want to delete this invoice?')) return
  try {
    await apiDeleteInvoice(id)
    alert('Invoice deleted')
    emit('refresh')
  } catch (e) {
    alert('Failed to delete: ' + e.message)
  }
}
</script>
