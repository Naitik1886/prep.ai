import { cn } from "@/lib/utils"
import { Container } from "./container"
import LogoContainer from "./logo-container"
import { MainRoutes } from "@/lib/helper"
import { NavLink } from "react-router-dom"
import { useAuth } from "@clerk/clerk-react"
import ProfileContainer from "@/containers/profile-container"
import { ToggleContainer } from "@/containers/toggle-container"
import { ModeToggle } from "./mode-toggle"

function Header() {

  const { userId } = useAuth()

  return (
    <header className={cn("w-full border-b duration-150 transition-all ease-in-out")}>
      <Container>
        <div className="flex items-center gap-4">
          {/* logo */}
          <LogoContainer />

          {/* nav */}
          <nav className="hidden md:flex items-center gap-3">
            <ul className="flex items-center gap-6">

              {MainRoutes.map((x) => (
                <li key={x.href}>
                  <NavLink
                    className={({ isActive }) =>
                      cn("text-base text-neutral-500 ",
                        isActive && "text-neutral font-semibold")
                    }
                    to={x.href}
                  >
                    {x.label}

                  </NavLink>
                </li>
              ))}

              {userId && (
                <NavLink to={"/generate"} className={({ isActive }) =>
                  cn("text-base text-neutral-500 ",
                    isActive && " text-neutral font-semibold ")
                }> Take an Interview </NavLink>
              )}


            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-6">
            {/* mode */}
            <ModeToggle/>
            {/* profile butoon */}
            <ProfileContainer />
            {/* toggle for mobile */}
            <ToggleContainer />
          </div>


        </div>
      </Container>
    </header>
  )
}

export default Header
