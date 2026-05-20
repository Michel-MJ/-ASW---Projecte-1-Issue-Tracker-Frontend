import { createRouter, createWebHistory } from 'vue-router'

// Importem les vistes
import IssueList from '../views/IssueList.vue'
import IssueDetail from '../views/IssueDetail.vue'
import IssueForm from '../views/IssueForm.vue'
import ProfileView from '../views/ProfileView.vue'
import SettingsView from '../views/SettingsView.vue'
import ProfileEdit from '../views/ProfileEdit.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/issues',
      name: 'index',
      component: IssueList
    },
    {
      path: '/issues/new',
      name: 'issue-new',
      component: IssueForm
    },
    {
      path: '/issues/:id',
      name: 'issue-detail',
      component: IssueDetail
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView
    },
    {
      path: '/profile/edit',
      name: 'profile-edit',
      component: ProfileEdit
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView
    },
    {
      path: '/issues/:id/edit',
      name: 'issue-edit',
      component: IssueForm
    }
  ]
})

export default router