<!-- src/components/Login.vue -->
<template>
  <div class="container-fluid">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-body">
            <h2 class="card-title text-center text-success mb-4">
              <i class="bi bi-shield-lock"></i> Access Dashboard
            </h2>
            <form @submit.prevent="onSubmit">
              <div class="mb-3">
                <label for="accessCode" class="form-label">
                  <i class="bi bi-key"></i> Access Code
                </label>
                <input
                  id="accessCode"
                  v-model="accessCode"
                  type="password"
                  class="form-control"
                  placeholder="Enter access code"
                  required
                />
              </div>
              <div class="d-grid">
                <button type="submit" class="btn btn-success">
                  <i class="bi bi-box-arrow-in-right"></i> Login
                </button>
              </div>
            </form>
            <div v-if="err" class="alert alert-danger mt-3" role="alert">
              <i class="bi bi-exclamation-triangle"></i> {{ err }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const accessCode = ref('')
const err = ref(null)
const router = useRouter()

function onSubmit() {
  err.value = null
  const hardcodedCode = '777666555444333222111'
  if (accessCode.value === hardcodedCode) {
    const expires = Date.now() + 30 * 60 * 1000 // 30 minutes
    localStorage.setItem('session_expires', expires.toString())
    router.push('/')
  } else {
    err.value = 'Invalid access code. Please try again.'
  }
}
</script>
