import { SettingsIcon } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import DatabaseSetupGuide from "@/components/database-setup-guide";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 mb-6">
          <SettingsIcon className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              <div className="bg-primary/10 text-primary px-3 py-2 rounded-md text-sm font-medium">
                Development
              </div>
            </nav>
          </div>

          <div className="lg:col-span-3">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Database Configuration</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Set up your local development database connection
                </p>
              </div>
              
              <Separator />
              
              <DatabaseSetupGuide />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
