<!-- src/components/Login.vue -->
<template>
  <div>
    <h2>Login</h2>
    <form @submit.prevent="onSubmit">
      <div>
        <label>Email</label><br />
        <input v-model="email" type="email" required />
      </div>
      <div style="margin-top: 8px">
        <label>Password</label><br />
        <input v-model="password" type="password" required />
      </div>
      <div style="margin-top: 12px">
        <button type="submit">Sign in</button>
      </div>
    </form>
    <p v-if="err" style="color: crimson">{{ err }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { signIn } from '../api'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const err = ref(null)
const router = useRouter()

async function onSubmit() {
  err.value = null
  try {
    const res = await signIn(email.value, password.value)
    if (res.error) {
      let errorMsg = 'Login failed'
      if (res.error.message.includes('Invalid login credentials')) {
        errorMsg = 'Invalid email or password. Please check your credentials.'
      } else if (res.error.message.includes('User not found')) {
        errorMsg = 'User not registered. Please sign up or check your email.'
      } else if (res.error.message.includes('Invalid password')) {
        errorMsg = 'Incorrect password. Please try again.'
      } else {
        errorMsg = res.error.message
      }
      err.value = errorMsg
      return
    }
    // On success route to dashboard
    router.push('/')
  } catch (e) {
    err.value = e.message || 'Login error. Please try again.'
  }
}
</script>
