import AdminNav from "@/components/AdminNav";

export default function Layout({children}: {children: React.ReactNode}) {
     return (
          <body className={` font-inter flex flex-col min-h-screen`}>
        {/* Page Content */}
        <main className="flex-1 bg-gray-100">{children}</main>

        {/* Bottom Navigation - Will be conditionally hidden by CSS */}
        <AdminNav />
      </body>
     );
}