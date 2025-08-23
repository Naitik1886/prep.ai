import Footer from "@/views/footer"
import Header from "@/components/header"
import { AuthHandler } from "@/handlers/user-auth-handler"
import {Outlet} from "react-router-dom"

function PublicLayout() {
  return (
    <div>
      <AuthHandler/>
      <Header />
      <Outlet />
      <Footer />
    </div>
  )
}

export default PublicLayout
