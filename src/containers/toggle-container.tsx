import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import { MainRoutes } from "@/lib/helper"
import { cn } from "@/lib/utils"
import { useAuth } from "@clerk/clerk-react"
import { Menu } from "lucide-react"
import { NavLink } from "react-router-dom"



export function ToggleContainer() {
    const { userId } = useAuth()

    return (
        <Sheet>
            <SheetTrigger
                className="block md:hidden"
            >
                <Menu />
            </SheetTrigger>
            <SheetContent className="p-6">
                <nav>
                    <ul className="flex flex-col items-start gap-8" >
                        {MainRoutes.map((x) => (
                            <li key={x.href}>
                                <NavLink  className={({ isActive }) =>
                  cn(
                    "text-base text-neutral-600",
                    isActive && "text-neutral-900 font-semibold"
                  )
                } to={x.href}>
                                    {x.label}

                                </NavLink>

                            </li>
                              ))}
                            {userId && (
                                <NavLink   className={({ isActive }) =>
                  cn(
                    "text-base text-neutral-600",
                    isActive && "text-neutral-900 font-semibold"
                  )
                } to={"/generate"}>
                                Take an Interview
                                
                                </NavLink>
                            )}
                      
                    </ul>
                </nav>



            </SheetContent>
        </Sheet>
    )
}



