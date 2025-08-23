import { cn } from "@/lib/utils";

interface headingsProps{
    title:string,
    description?:string,
    isSubheading?:boolean,
}


export default function Headings({title,description,isSubheading,} : headingsProps) {
  return (
    <div>
      <h2
        className={cn(
          "text-2xl md:text-3xl font-semibold font-sans",
          isSubheading && "text-lg md:text-xl"
        )}
      >
        {title}
      </h2>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
