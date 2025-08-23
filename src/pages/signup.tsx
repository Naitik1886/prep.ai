import { SignUp } from "@clerk/clerk-react"

function SignupPage() {
  return (
   <div className="flex items-center justify-center  w-full h-screen ">
      <SignUp  routing="path" 
        path="/signup"
        signInUrl="/signin"/>
    </div>
  )
}

export default SignupPage

