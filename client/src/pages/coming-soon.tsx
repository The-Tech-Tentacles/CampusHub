import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Construction } from "lucide-react";
import { useLocation } from "wouter";

export default function ComingSoon() {
  const [location] = useLocation();
  
  const featureMap: Record<string, { title: string; description: string }> = {
    "/lms": {
      title: "Learning Management System",
      description: "Access course materials, submit assignments, take quizzes, and participate in discussion forums.",
    },
    "/chat": {
      title: "Real-time Chat",
      description: "Connect with students and faculty through instant messaging and group chats.",
    },
    "/attendance": {
      title: "QR Attendance",
      description: "Mark your attendance using QR code scanning for a seamless check-in experience.",
    },
    "/analytics": {
      title: "Advanced Analytics",
      description: "View detailed analytics and insights about academic performance and trends.",
    },
  };

  const feature = featureMap[location] || {
    title: "New Feature",
    description: "This feature is currently under development.",
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-12 pb-12">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-6">
                <Construction className="h-16 w-16 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <Badge variant="secondary" className="mb-2">Coming Soon</Badge>
              <h1 className="text-3xl font-serif font-bold">{feature.title}</h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                {feature.description}
              </p>
            </div>
            <div className="pt-4">
              <p className="text-sm text-muted-foreground">
                We're working hard to bring this feature to you. Stay tuned for updates!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
