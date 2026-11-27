import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import TeamsDemoPage from './pages/TeamsDemoPage'
import FillQuestionnairePage from './pages/membre/FillQuestionnairePage'
import MyAbsencesPage from './pages/membre/MyAbsencesPage'
import MyAppointmentsPage from './pages/membre/MyAppointmentsPage'
import MyDocumentsPage from './pages/membre/MyDocumentsPage'
import MyProfilePage from './pages/membre/MyProfilePage'
import MyQuestionnairesPage from './pages/membre/MyQuestionnairesPage'
import AbsencesPage from './pages/rh/AbsencesPage'
import AlertsPage from './pages/rh/AlertsPage'
import CalendarPage from './pages/rh/CalendarPage'
import CandidateDetailPage from './pages/rh/CandidateDetailPage'
import CandidatesPage from './pages/rh/CandidatesPage'
import ConnectionsPage from './pages/rh/ConnectionsPage'
import CvBotPage from './pages/rh/CvBotPage'
import ModelPage from './pages/rh/ModelPage'
import QuestionnaireDetailPage from './pages/rh/QuestionnaireDetailPage'
import MemberReportPage from './pages/rh/MemberReportPage'
import MembersPage from './pages/rh/MembersPage'
import QuestionnairesPage from './pages/rh/QuestionnairesPage'
import TeamDetailPage from './pages/rh/TeamDetailPage'
import TeamsPage from './pages/rh/TeamsPage'

/** Page d'accueil selon le rôle. */
function HomeRedirect() {
  const { user } = useAuth()
  return <Navigate to={user.role === 'rh' ? '/equipes' : '/mes-questionnaires'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/connexion" element={<LoginPage />} />
          {/* Maquette de Teams pour la démo vidéo : Trajectoires y est ouvert comme une application */}
          <Route path="/teams" element={<TeamsDemoPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<HomeRedirect />} />

              <Route element={<ProtectedRoute role="rh" />}>
                <Route path="equipes" element={<TeamsPage />} />
                <Route path="equipes/:teamId" element={<TeamDetailPage />} />
                <Route path="membres" element={<MembersPage />} />
                <Route path="membres/:memberId" element={<MemberReportPage />} />
                <Route path="questionnaires" element={<QuestionnairesPage />} />
                <Route path="questionnaires/modeles/:modelId" element={<ModelPage />} />
                <Route path="questionnaires/:questionnaireId" element={<QuestionnaireDetailPage />} />
                <Route path="alertes" element={<AlertsPage />} />
                <Route path="depot-cv" element={<CvBotPage />} />
                <Route path="candidats" element={<CandidatesPage />} />
                <Route path="candidats/:candidateId" element={<CandidateDetailPage />} />
                <Route path="calendrier" element={<CalendarPage />} />
                <Route path="absences" element={<AbsencesPage />} />
                <Route path="connexions" element={<ConnectionsPage />} />
              </Route>

              <Route element={<ProtectedRoute role="membre" />}>
                <Route path="mes-questionnaires" element={<MyQuestionnairesPage />} />
                <Route path="mes-questionnaires/:questionnaireId" element={<FillQuestionnairePage />} />
                <Route path="mes-rendez-vous" element={<MyAppointmentsPage />} />
                <Route path="mes-absences" element={<MyAbsencesPage />} />
                <Route path="mes-documents" element={<MyDocumentsPage />} />
                <Route path="mon-profil" element={<MyProfilePage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
