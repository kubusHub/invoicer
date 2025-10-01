<template>
  <div>
    <form @submit.prevent="applyFilters">
      <div class="mb-3">
        <label for="statusFilter" class="form-label">Status</label>
        <select id="statusFilter" v-model="localFilters.status" class="form-select">
          <option value="">All</option>
          <option>Unpaid</option>
          <option>Paid</option>
          <option>Partially Paid</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="dateFrom" class="form-label">Date From</label>
        <input type="date" id="dateFrom" v-model="localFilters.dateFrom" class="form-control" />
      </div>
      <div class="mb-3">
        <label for="dateTo" class="form-label">Date To</label>
        <input type="date" id="dateTo" v-model="localFilters.dateTo" class="form-control" />
      </div>
      <div class="mb-3">
        <label for="clientFilter" class="form-label">Client</label>
        <input
          type="text"
          id="clientFilter"
          v-model="localFilters.client"
          class="form-control"
          placeholder="NIP / Firma"
        />
      </div>
      <div class="mb-3">
        <label for="presetFilter" class="form-label">Saved Presets</label>
        <select
          id="presetFilter"
          v-model="selectedPreset"
          class="form-select"
          @change="applyPreset"
        >
          <option value="">Select a preset</option>
          <option v-for="(preset, index) in presets" :key="index" :value="index">
            {{ preset.name }}
          </option>
        </select>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  filters: Object,
})
const emit = defineEmits(['apply'])

const localFilters = ref({
  status: '',
  dateFrom: '',
  dateTo: '',
  client: '',
})

const presets = ref([
  { name: 'Unpaid Invoices', filters: { status: 'Unpaid' } },
  { name: 'Paid Invoices', filters: { status: 'Paid' } },
  { name: 'Last Month', filters: { dateFrom: getLastMonthStart(), dateTo: getLastMonthEnd() } },
])

const selectedPreset = ref('')

watch(
  () => props.filters,
  (newFilters) => {
    localFilters.value = { ...newFilters }
  },
  { immediate: true },
)

function applyFilters() {
  emit('apply', { ...localFilters.value })
}

function resetFilters() {
  localFilters.value = {
    status: '',
    dateFrom: '',
    dateTo: '',
    client: '',
  }
  selectedPreset.value = ''
  emit('apply', { ...localFilters.value })
}

function applyPreset() {
  if (selectedPreset.value === '') return
  const presetFilters = presets.value[selectedPreset.value].filters
  localFilters.value = { ...localFilters.value, ...presetFilters }
  emit('apply', { ...localFilters.value })
}

function getLastMonthStart() {
  const date = new Date()
  date.setDate(1)
  date.setMonth(date.getMonth() - 1)
  return date.toISOString().split('T')[0]
}

function getLastMonthEnd() {
  const date = new Date()
  date.setDate(0)
  return date.toISOString().split('T')[0]
}
</script>
