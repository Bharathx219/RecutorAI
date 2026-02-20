import { MemberProvider } from '@/integrations';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import ErrorPage from '@/integrations/errorHandlers/ErrorPage';
import HomePage from '@/components/pages/HomePage';
import LoginPage from '@/components/pages/LoginPage';
import RegisterPage from '@/components/pages/RegisterPage';
import CandidateDashboard from '@/components/pages/CandidateDashboard';
import BrowseJobsPage from '@/components/pages/BrowseJobsPage';
import JobDetailsPage from '@/components/pages/JobDetailsPage';
import MyApplicationsPage from '@/components/pages/MyApplicationsPage';
import CandidateProfilePage from '@/components/pages/CandidateProfilePage';
import RecruiterDashboard from '@/components/pages/RecruiterDashboard';
import PostJobPage from '@/components/pages/PostJobPage';
import ApplicantsPage from '@/components/pages/ApplicantsPage';

// Layout component that includes ScrollToTop
function Layout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "candidate/dashboard",
        element: <CandidateDashboard />,
      },
      {
        path: "candidate/browse-jobs",
        element: <BrowseJobsPage />,
      },
      {
        path: "candidate/job/:id",
        element: <JobDetailsPage />,
      },
      {
        path: "candidate/applications",
        element: <MyApplicationsPage />,
      },
      {
        path: "candidate/profile",
        element: <CandidateProfilePage />,
      },
      {
        path: "recruiter/dashboard",
        element: <RecruiterDashboard />,
      },
      {
        path: "recruiter/post-job",
        element: <PostJobPage />,
      },
      {
        path: "recruiter/applicants",
        element: <ApplicantsPage />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
], {
  basename: import.meta.env.BASE_NAME,
});

export default function AppRouter() {
  return (
    <MemberProvider>
      <RouterProvider router={router} />
    </MemberProvider>
  );
}
