import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/',
      component: () => import('@/components/layout/DoctorLayout.vue'),
      children: [
        {
          path: '',
          redirect: '/dashboard'
        },
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/DashboardView.vue')
        },
        {
          path: 'patients',
          name: 'PatientList',
          component: () => import('@/views/PatientListView.vue')
        },
        {
          path: '/emr-editor/:patientId?',  // 这里的 :patientId? 表示可选参数
          name: 'EMREditor',
          component: () => import('@/views/EMREditorView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'data-reference',
          name: 'DataReference',
          component: () => import('@/views/DataReferenceView.vue')
        },
        {
          path: 'template-library',
          name: 'TemplateLibrary',
          component: () => import('@/views/TemplateLibraryView.vue')
        },
        {
          path: 'quality',
          name: 'QualityManage',
          component: () => import('@/views/QualityManageView.vue'),
          meta: { title: '病历质控' }//新添加：3/21
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFoundView.vue')
    }
  ]
})

// 修复路由守卫 - 不再使用 next 回调
router.beforeEach((to, from) => {
  console.log('路由跳转:', from.path, '->', to.path)
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  
  if (to.path !== '/login' && !isLoggedIn) {
    return '/login'  // 直接返回路径字符串
  }
  return true  // 返回 true 表示继续导航
})

export default router