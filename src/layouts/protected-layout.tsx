import { LoaderPage } from "@/views/loader-page"
import { useAuth } from "@clerk/clerk-react"
import { Navigate } from "react-router-dom"

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isSignedIn, isLoaded } = useAuth()

    if (!isLoaded) {
        return (
            <LoaderPage />
        )
    };

    if (!isSignedIn) {
        return <Navigate to={"/signin"} replace />
    }

    return children;
}

export default ProtectedRoute
