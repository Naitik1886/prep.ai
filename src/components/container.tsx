import { cn } from "@/lib/utils";

interface Containerprops {
    children: React.ReactNode;
    className?: string;
}

export function Container({ children, className }: Containerprops) {
    return (
        <div
            className={cn("container  mx-auto px-4 md:px-8 py-4 w-full", className)}>
            {children}
        </div>
    )
}



