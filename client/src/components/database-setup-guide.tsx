import { useState } from "react";
import { Check, Copy, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DatabaseSetupGuide() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const databaseUrl = "postgresql://postgres:psyduck@localhost:1222/habitvision?schema=public";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(databaseUrl);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Database URL copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Local Database Setup
          </CardTitle>
          <CardDescription>
            Follow these steps to set up your local database connection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">1. Create PostgreSQL Database</h3>
            <div className="text-sm text-gray-500">
              Create a new PostgreSQL database named <code>habitvision</code>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">2. Configure Environment Variables</h3>
            <div className="text-sm text-gray-500">
              Create a <code>.env</code> file in your project root with the following content:
            </div>
            <div className="relative">
              <pre className="bg-secondary/50 p-4 rounded-lg text-sm font-mono">
                DATABASE_URL="{databaseUrl}"
                JWT_SECRET="your-super-secret-key-change-this-in-production"
              </pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">3. Install Dependencies</h3>
            <div className="text-sm text-gray-500">
              Run the following command to install required packages:
            </div>
            <pre className="bg-secondary/50 p-4 rounded-lg text-sm font-mono">
              npm install
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">4. Push Database Schema</h3>
            <div className="text-sm text-gray-500">
              Initialize your database schema with:
            </div>
            <pre className="bg-secondary/50 p-4 rounded-lg text-sm font-mono">
              npm run db:push
            </pre>
          </div>

          <Alert>
            <AlertTitle>Ready to go!</AlertTitle>
            <AlertDescription>
              Your local database is now set up and ready for development. Start the application with <code>npm run dev</code>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
