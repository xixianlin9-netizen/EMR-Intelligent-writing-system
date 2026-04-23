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
          path: '/emr-editor/:patientId?',
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
          meta: { title: '病历质控' }
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

router.beforeEach((to, from) => {
  console.log('路由跳转:', from.path, '->', to.path)
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  
  if (to.path !== '/login' && !isLoggedIn) {
    return '/login'
  }
  return true
})

export default router