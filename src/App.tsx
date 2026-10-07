import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { Layout } from '@/components/layout'
import { AssessmentAnalyzingPage } from '@/pages/assessment-analyzing'
import { AssessmentQuestionsPage } from '@/pages/assessment-questions'
import { AssessmentStartPage } from '@/pages/assessment-start'
import { ComparePage } from '@/pages/compare'
import { JobDetailPage } from '@/pages/job-detail'
import { JobsPage } from '@/pages/jobs'
import { LandingPage } from '@/pages/landing'
import { ResultPage } from '@/pages/result'
import { SavedPage } from '@/pages/saved'
import { SearchPage } from '@/pages/search'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="assessment" element={<AssessmentStartPage />} />
          <Route path="assessment/questions" element={<AssessmentQuestionsPage />} />
          <Route path="assessment/analyzing" element={<AssessmentAnalyzingPage />} />
          <Route path="result" element={<ResultPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="jobs/:id" element={<JobDetailPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="saved" element={<SavedPage />} />
          <Route path="compare" element={<ComparePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
