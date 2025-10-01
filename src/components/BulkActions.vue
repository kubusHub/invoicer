<template>
  <div class="mb-3">
    <button class="btn btn-danger me-2" :disabled="selected.length === 0" @click="deleteSelected">
      Delete Selected
    </button>
    <button class="btn btn-secondary" :disabled="selected.length === 0" @click="exportSelected">
      Export Selected
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { deleteInvoice, exportInvoicesToCSV } from '../api'

const props = defineProps({
  selected: Array,
})
const emit = defineEmits(['refresh', 'clearSelection'])

async function deleteSelected() {
  if (!confirm('Are you sure you want to delete selected invoices?')) return
  try {
    for (const id of props.selected) {
      await deleteInvoice(id)
    }
    alert('Selected invoices deleted')
    emit('refresh')
    emit('clearSelection')
  } catch (e) {
    alert('Failed to delete: ' + e.message)
  }
}

function exportSelected() {
  if (props.selected.length === 0) return
  exportInvoicesToCSV({ ids: props.selected })
}
</script>
