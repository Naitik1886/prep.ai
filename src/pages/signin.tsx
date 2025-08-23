import { SignIn } from "@clerk/clerk-react"

function SigninPage() {
  return (
    <div className="flex items-center justify-center  w-full h-screen ">
      <SignIn  routing="path" 
        path="/signin"
        signUpUrl="/signup"/>
    </div>
  )
}

export default SigninPage
