<!-- src/components/Dashboard.vue -->
<template>
  <div class="container-fluid">
    <div class="row mb-3">
      <div class="col-md-6">
        <h1 class="text-success">Invoices Dashboard</h1>
      </div>
      <div class="col-md-6 text-end">
        <button class="btn btn-outline-success me-2" @click="$router.push('/monthly')">
          Monthly Summaries
        </button>
        <button class="btn btn-outline-primary me-2" @click="$router.push('/reports')">
          Reports
        </button>
        <button class="btn btn-outline-secondary me-2" @click="exportPDF">Export to PDF</button>
        <button class="btn btn-outline-danger me-2" @click="logout">Logout</button>
      </div>
    </div>

    <div class="row mb-3">
      <div class="col-md-4">
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
          <input
            v-model="q"
            type="text"
            class="form-control"
            placeholder="Search NIP / Firma / Numer"
            @input="onSearch"
          />
        </div>
      </div>
      <div class="col-md-8 text-end">
        <button
          class="btn btn-outline-primary"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#filtersCollapse"
          aria-expanded="false"
          aria-controls="filtersCollapse"
        >
          <i class="bi bi-funnel"></i> Filters
        </button>
      </div>
    </div>

    <div class="collapse mb-3" id="filtersCollapse">
      <div class="card card-body">
        <Filters @apply="onApplyFiltersModal" />
        <div class="text-end mt-3">
          <button type="button" class="btn btn-secondary me-2" @click="resetFilters">Reset</button>
          <button type="button" class="btn btn-success" @click="applyModalFilters">
            Apply Filters
          </button>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <InvoiceTable :invoices="invoices" @refresh="load" v-model:selected="selected" />
        <nav aria-label="Pagination" class="mt-3">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: page <= 1 }">
              <button class="page-link" @click="prevPage" :disabled="page <= 1">Previous</button>
            </li>
            <li class="page-item">
              <span class="page-link">Page {{ page }} of {{ totalPages }}</span>
            </li>
            <li class="page-item" :class="{ disabled: page >= totalPages }">
              <button class="page-link" @click="nextPage" :disabled="page >= totalPages">
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <div v-if="loading" class="text-center mt-3">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { fetchInvoices, exportInvoicesToCSV, exportInvoicesToPDF } from '../api'
import InvoiceTable from './InvoiceTable.vue'
import Filters from './Filters.vue'

const router = useRouter()

const invoices = ref([])
const filters = ref({})
const q = ref('')
const modalFilters = ref({})
const page = ref(1)
const limit = ref(50)
const total = ref(0)
const loading = ref(false)
const error = ref('')
const selected = ref([])

const totalPages = computed(() => Math.ceil(total.value / limit.value))

async function load() {
  loading.value = true
  error.value = ''
  try {
    const { data, count } = await fetchInvoices({
      ...filters.value,
      q: q.value,
      page: page.value,
      limit: limit.value,
    })
    invoices.value = data
    total.value = count
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function onSearch() {
  filters.value.q = q.value
  page.value = 1
  load()
}

function onApplyFiltersModal(newFilters) {
  modalFilters.value = newFilters
}

function applyModalFilters() {
  filters.value = { ...filters.value, ...modalFilters.value }
  page.value = 1
  load()
  const modal = bootstrap.Modal.getInstance(document.getElementById('filtersModal'))
  if (modal) modal.hide()
}

function onApplyFilters(newFilters) {
  filters.value = { ...filters.value, ...newFilters }
  page.value = 1
  load()
}

function prevPage() {
  if (page.value > 1) {
    page.value--
    load()
  }
}

function nextPage() {
  if (page.value < totalPages.value) {
    page.value++
    load()
  }
}

function exportCSV() {
  exportInvoicesToCSV({ ...filters.value, q: q.value })
}

function exportPDF() {
  exportInvoicesToPDF({ ...filters.value, q: q.value })
}

function logout() {
  sessionStorage.removeItem('session_expires')
  router.push('/login')
}

onMounted(load)
</script>
