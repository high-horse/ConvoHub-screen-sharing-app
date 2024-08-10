import { reactive } from 'vue';

export const auth = reactive({
  isAuthenticated: false,
  user: null as any | null,
  login(userData: any) {
    this.isAuthenticated = true
    this.user = userData
    // In a real app, you'd store the token in localStorage here
  },
  logout() {
    this.isAuthenticated = false
    this.user = null
    // In a real app, you'd remove the token from localStorage here
  }
})