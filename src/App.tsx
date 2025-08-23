import { BrowserRouter as Router , Routes , Route } from "react-router-dom"
import PublicLayout from "./layouts/public-layout"
import Homepage from "./pages/home"
import SignupPage from "./pages/signup"
import SigninPage from "./pages/signin"
import { ThemeProvider } from "./components/theme-provider"
import ProtectedRoute from "./layouts/protected-layout"
import MainLayout from "./layouts/main-layout"
import { Generate } from "./views/generate"
import Dashboard from "./pages/dashboard"
import CreateEditPage from "./pages/create-edit-page"
import MockLockPage from "./pages/mock-load-page"
import { MockInterviewPage } from "./pages/mock-interview-page"
import Feedback from "./pages/feedback"
import ContactPage from "./pages/contact"
function App() {
  return (
    <ThemeProvider  defaultTheme="dark" storageKey="vite-ui-theme">
     


    <Router>
      <Routes>
        {/* public Routes */}
        <Route element={<PublicLayout/>}>
        <Route path="/" element={<Homepage /> }/>
        <Route path="/contact" element={<ContactPage /> }/>
        </Route>
        <Route path="/signup/*" element={<SignupPage/>}/>
        <Route path="/signin/*" element={<SigninPage/>}/>


        {/* protected routes  */}
        <Route 
        element={
        <ProtectedRoute>
          <MainLayout/>
        </ProtectedRoute>}
        >

          <Route path="/generate" element={<Generate/>}>
          <Route index element={<Dashboard/>}/> 
          <Route path=":interviewId" element={<CreateEditPage/>}/>
          <Route path="interview/:interviewId" element={<MockLockPage/>}/>
          <Route path="interview/:interviewId/start" element={<MockInterviewPage/>} />
          <Route path="feedback/:interviewId" element={<Feedback/>}/>

          </Route>

        </Route>

      </Routes>
    </Router>
    </ThemeProvider>

  )
}

export default App