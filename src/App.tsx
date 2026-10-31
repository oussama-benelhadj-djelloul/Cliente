import { BrowserRouter, Route, Routes } from 'react-router'

import { SiteHeader } from '@/components/site-header'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/hooks/use-auth'
import { AuthPage } from '@/pages/auth'
import { CompanyPage } from '@/pages/company'
import { DashboardPage } from '@/pages/dashboard'
import { HomePage } from '@/pages/home'
import { NotFoundPage } from '@/pages/not-found'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-svh">
          <SiteHeader />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/c/:slug" element={<CompanyPage />} />
            <Route path="/login" element={<AuthPage key="login" mode="login" />} />
            <Route path="/signup" element={<AuthPage key="signup" mode="signup" />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <Toaster position="bottom-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  )
}
