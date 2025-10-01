<template>
  <div class="container">
    <div class="mb-3">
      <button class="btn btn-secondary" @click="$router.push('/')">Back</button>
    </div>
    <h1>Reports</h1>
    <div v-if="loading">Loading reports...</div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-else>
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Total Invoices</h5>
              <p class="card-text">{{ reports.totalInvoices }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Paid</h5>
              <p class="card-text">{{ reports.totalPaid }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Unpaid</h5>
              <p class="card-text">{{ reports.totalUnpaid }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Total Brutto</h5>
              <p class="card-text">{{ formatCurrency(reports.totalBrutto) }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <h3>Monthly Trends</h3>
          <Bar :data="chartData" :options="chartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import { fetchReports } from '../api'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const reports = ref({})
const loading = ref(false)
const error = ref('')

const chartData = computed(() => ({
  labels: reports.value.monthlyData?.map((d) => d.month) || [],
  datasets: [
    {
      label: 'Total Invoices',
      data: reports.value.monthlyData?.map((d) => d.total) || [],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    },
    {
      label: 'Paid',
      data: reports.value.monthlyData?.map((d) => d.paid) || [],
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    },
    {
      label: 'Unpaid',
      data: reports.value.monthlyData?.map((d) => d.unpaid) || [],
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  scales: {
    y: {
      beginAtZero: true,
    },
  },
}

async function load() {
  loading.value = true
  try {
    reports.value = await fetchReports()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function formatCurrency(val) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(val || 0)
}

onMounted(load)
</script>
