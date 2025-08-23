import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import React from "react";


interface BreadCrumbprops{
 breadCrumbPage: string;
  breadCrumpItems?: { link: string; label: string }[];
}




export default function CustomBreadCrumb({breadCrumbPage, breadCrumpItems}:BreadCrumbprops ) {
  return (
    <Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    {breadCrumpItems && breadCrumpItems.map((item,i) => (
      <React.Fragment key={i}>
        <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={item.link}
                  className="hover:text-emerald-500"
                >
                  {item.label}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </React.Fragment>
      
    ))}
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>{breadCrumbPage}</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
  )
}
