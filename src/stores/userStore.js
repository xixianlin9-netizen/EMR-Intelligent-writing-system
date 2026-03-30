// src/stores/userStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 用户状态
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  const isLoggedIn = ref(!!token.value)

  // 设置用户信息
  function setUserInfo(info) {
    userInfo.value = info
    isLoggedIn.value = true
    // 也可以生成一个简单的token
    token.value = 'mock-token-' + Date.now()
  }

  // 登录
  function login(username, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (password === '123456') {
          const userData = {
            name: username,
            username: username
          }
          
          setUserInfo(userData)
          resolve(userData)
        } else {
          reject(new Error('密码错误'))
        }
      }, 500)
    })
  }

  // 退出登录
  function logout() {
    token.value = ''
    userInfo.value = null
    isLoggedIn.value = false
    
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('isLoggedIn')
  }

  // 检查是否已登录
  function checkLogin() {
    const hasToken = !!localStorage.getItem('token')
    isLoggedIn.value = hasToken
    return hasToken
  }

  // 获取用户信息
  const userName = computed(() => userInfo.value?.name || '')

  return {
    token,
    userInfo,
    isLoggedIn,
    userName,
    login,
    logout,
    checkLogin,
    setUserInfo
  }
})