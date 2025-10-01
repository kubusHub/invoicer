<template>
  <div class="container">
    <div class="mb-3">
      <button class="btn btn-secondary" @click="$router.back()" title="Back">
        <i class="bi bi-arrow-left"></i>
      </button>
    </div>
    <h1>Monthly Summaries</h1>
    <div v-if="loading">Loading summaries...</div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-else class="row">
      <div v-for="month in monthlySummaries" :key="month.month" class="col-md-4 mb-3">
        <button
          class="btn btn-outline-success w-100 text-start"
          @click="loadMonthInvoices(month.month)"
        >
          <h5 class="text-success">{{ month.month }}</h5>
          <p>Total Invoices: {{ month.total }}</p>
          <p>Paid: {{ month.paid }} | Unpaid: {{ month.unpaid }}</p>
          <p>Total Netto: {{ formatCurrency(month.totalNetto) }}</p>
          <p>Total Brutto: {{ formatCurrency(month.totalBrutto) }}</p>
          <p>Total Paid Brutto: {{ formatCurrency(month.totalPaidBrutto) }}</p>
          <p>Total Unpaid Brutto: {{ formatCurrency(month.totalUnpaidBrutto) }}</p>
        </button>
      </div>
    </div>

    <!-- Monthly Invoices Table -->
    <div v-if="selectedMonth" class="mt-4">
      <div class="mb-3">
        <button class="btn btn-secondary" @click="$router.back()" title="Back">
          <i class="bi bi-arrow-left"></i>
        </button>
      </div>
      <h2>{{ selectedMonth }} Invoices</h2>
      <InvoiceTable :invoices="monthInvoices" @refresh="loadMonthInvoices(selectedMonth)" />
      <div class="row mt-3">
        <div class="col-md-3">
          <strong>Total Invoices: {{ monthSummary.total }}</strong>
        </div>
        <div class="col-md-3">
          <strong>Paid: {{ monthSummary.paid }}</strong>
        </div>
        <div class="col-md-3">
          <strong>Unpaid: {{ monthSummary.unpaid }}</strong>
        </div>
        <div class="col-md-3">
          <strong>Total Netto: {{ formatCurrency(monthSummary.totalNetto) }}</strong>
        </div>
        <div class="col-md-3">
          <strong>Total Brutto: {{ formatCurrency(monthSummary.totalBrutto) }}</strong>
        </div>
        <div class="col-md-3">
          <strong>Total Paid Brutto: {{ formatCurrency(monthSummary.totalPaidBrutto) }}</strong>
        </div>
        <div class="col-md-3">
          <strong>Total Unpaid Brutto: {{ formatCurrency(monthSummary.totalUnpaidBrutto) }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchMonthlySummary, fetchInvoices } from '../api'
import InvoiceTable from './InvoiceTable.vue'

const monthlySummaries = ref([])
const monthInvoices = ref([])
const selectedMonth = ref('')
const monthSummary = ref({})
const loading = ref(false)
const error = ref('')

async function load() {
  loading.value = true
  try {
    monthlySummaries.value = await fetchMonthlySummary()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function loadMonthInvoices(month) {
  selectedMonth.value = month
  const { data, summary } = await fetchInvoices({ month })
  monthInvoices.value = data
  monthSummary.value = summary
}

function formatCurrency(val) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(val || 0)
}

onMounted(load)
</script>
