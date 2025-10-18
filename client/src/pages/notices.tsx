import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Clock,
  AlertTriangle,
  AlarmClock,
  Info,
  Calendar,
  User,
  Eye,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type NoticeType = "urgent" | "important" | "general";
type NoticeScope = "GLOBAL" | "DEPARTMENT" | "YEAR" | "CLASS";

interface Notice {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  type: NoticeType;
  scope: NoticeScope;
  publishedAt: string;
  isRead: boolean;
  department?: string;
  year?: number;
}

const getTypeIcon = (type: NoticeType) => {
  switch (type) {
    case "urgent":
      return AlertTriangle;
    case "important":
      return Info;
    case "general":
      return Clock;
  }
};

const getTypeColor = (type: NoticeType) => {
  switch (type) {
    case "urgent":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    case "important":
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800";
    case "general":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
  }
};

export default function Notices() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [activeTab, setActiveTab] = useState("recent");

  const canCreateNotice =
    user?.role && ["FACULTY", "HOD", "DEAN", "ADMIN"].includes(user.role);

  const notices: Notice[] = [
    {
      id: "1",
      title: "Emergency: Campus Closure Due to Weather Alert",
      content:
        "Due to severe weather conditions expected tomorrow, all classes and campus activities are suspended. Students are advised to stay in their accommodations and follow safety protocols. The cafeteria will remain open with limited hours (8 AM - 6 PM). Emergency contact: +1-234-567-8900. Further updates will be shared via official channels.",
      createdBy: "Dr. Sarah Johnson",
      type: "urgent",
      scope: "GLOBAL",
      publishedAt: "2024-01-15T10:30:00Z",
      isRead: false,
    },
    {
      id: "2",
      title: "Mid-Semester Examination Schedule Released",
      content:
        "The schedule for mid-semester examinations has been finalized and is now available on the student portal. Students are required to check their exam timings, venues, and seat numbers before the examination week begins. Any discrepancies should be reported to the academic office within 48 hours. Study materials and guidelines are also available for download.",
      createdBy: "Academic Office",
      type: "important",
      scope: "GLOBAL",
      publishedAt: "2024-01-14T14:20:00Z",
      isRead: false,
      department: "All Departments",
    },
    {
      id: "3",
      title: "Library Timings Extended for Exam Week",
      content:
        "To support students during the examination period, the central library will extend its operating hours from 7:00 AM to 11:00 PM throughout the exam week. Additional study spaces have been arranged in the community hall. Students are encouraged to follow library rules and maintain silence in designated study areas.",
      createdBy: "Library Administration",
      type: "urgent",
      scope: "GLOBAL",
      publishedAt: "2024-01-13T09:15:00Z",
      isRead: true,
    },
    {
      id: "4",
      title: "Guest Lecture: Future of AI and Quantum Computing",
      content:
        "Join us for an exciting guest lecture by Prof. Michael Chen from MIT on 'The Convergence of AI and Quantum Computing: Shaping Tomorrow's Technology'. The session will cover cutting-edge research, career opportunities, and interactive Q&A. Venue: Main Auditorium, Date: January 20th, Time: 2:00 PM - 4:00 PM.",
      createdBy: "Prof. David Williams",
      type: "important",
      scope: "DEPARTMENT",
      publishedAt: "2024-01-12T16:45:00Z",
      isRead: true,
      department: "Computer Science",
    },
    {
      id: "5",
      title: "Annual Sports Day Registration Now Open",
      content:
        "Get ready for the most exciting event of the year! Annual Sports Day registration is now live on the student portal. Choose from basketball, football, cricket, athletics, and many more events. Early bird registration gets exclusive merchandise. Deadline: January 25th. Let's make this sports day unforgettable!",
      createdBy: "Sports Committee",
      type: "general",
      scope: "GLOBAL",
      publishedAt: "2024-01-11T11:30:00Z",
      isRead: false,
    },
    {
      id: "6",
      title: "Scholarship Applications for Merit Students",
      content:
        "Merit-based scholarship applications are now open for exceptional students. This scholarship covers 50% of tuition fees for the next semester. Eligibility: CGPA above 8.5, active participation in extracurricular activities, and clean disciplinary record. Application deadline: January 30th. Apply through the student portal.",
      createdBy: "Financial Aid Office",
      type: "important",
      scope: "GLOBAL",
      publishedAt: "2024-01-10T13:20:00Z",
      isRead: true,
    },
  ];

  // Simple search logic
  const searchedNotices = searchTerm
    ? notices.filter(
        (notice) =>
          notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notice.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : notices;

  // Tab-based filtering
  const getTabNotices = (tab: string) => {
    switch (tab) {
      case "recent":
        return searchedNotices.sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
        );
      case "unread":
        return searchedNotices.filter((n) => !n.isRead);
      case "urgent":
        return searchedNotices.filter((n) => n.type === "urgent");
      case "my-dept":
        return searchedNotices.filter(
          (n) => n.scope === "DEPARTMENT" || n.scope === "GLOBAL"
        );
      default:
        return searchedNotices;
    }
  };

  const currentTabNotices = getTabNotices(activeTab);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    return content.length > maxLength
      ? content.substring(0, maxLength) + "..."
      : content;
  };

  const handleCreateNotice = () => {
    console.log("Creating notice");
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-2 p-3 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {canCreateNotice && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Notice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Notice</DialogTitle>
                <DialogDescription>
                  Share important information with students and faculty
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Notice title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Notice content"
                    rows={5}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Priority</Label>
                    <Select defaultValue="general">
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">🚨 Urgent</SelectItem>
                        <SelectItem value="important">⚠️ Important</SelectItem>
                        <SelectItem value="general">ℹ️ General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scope">Scope</Label>
                    <Select defaultValue="GLOBAL">
                      <SelectTrigger>
                        <SelectValue placeholder="Select scope" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GLOBAL">🌍 Global</SelectItem>
                        <SelectItem value="DEPARTMENT">
                          🏢 Department
                        </SelectItem>
                        <SelectItem value="YEAR">📚 Year</SelectItem>
                        <SelectItem value="CLASS">👥 Class</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateNotice}>Publish Notice</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search Bar */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notices"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 border-0 bg-white/80 dark:bg-gray-900/80 focus:bg-white dark:focus:bg-gray-900"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          <TabsTrigger
            value="recent"
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3"
          >
            <Clock className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Recent</span>
          </TabsTrigger>
          <TabsTrigger
            value="unread"
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3"
          >
            {/* <div className="h-2 w-2 rounded-full bg-blue-500" /> */}
            <AlarmClock className="h-4 w-4" />
            <div className="flex items-center gap-1">
              <span className="text-xs sm:text-sm">Unread</span>
              <Badge
                variant="secondary"
                className="text-[10px] sm:text-xs h-4 min-w-4 sm:h-5 sm:min-w-5 px-1 sm:px-2 rounded-full"
              >
                {searchedNotices.filter((n) => !n.isRead).length}
              </Badge>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="urgent"
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3"
          >
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <div className="flex items-center gap-1">
              <span className="text-xs sm:text-sm">Urgent</span>
              <Badge
                variant="destructive"
                className="text-[10px] sm:text-xs h-4 min-w-4 sm:h-5 sm:min-w-5 px-1 sm:px-2 rounded-full"
              >
                {searchedNotices.filter((n) => n.type === "urgent").length}
              </Badge>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="my-dept"
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3"
          >
            <Info className="h-4 w-4" />
            <span className="text-xs sm:text-sm">My Dept</span>
          </TabsTrigger>
        </TabsList>

        {/* Notices Content */}
        <TabsContent value={activeTab} className="space-y-4">
          {currentTabNotices.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-4xl mb-4">📭</div>
              <h3 className="text-lg font-semibold mb-2">No notices found</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search or filters"
                  : "No notices available at the moment"}
              </p>
            </Card>
          ) : (
            currentTabNotices.map((notice) => {
              const TypeIcon = getTypeIcon(notice.type);
              return (
                <Card
                  key={notice.id}
                  className="group hover:shadow-lg transition-all duration-200 border-l-4"
                  style={{
                    borderLeftColor:
                      notice.type === "urgent"
                        ? "#ef4444"
                        : notice.type === "important"
                        ? "#f59e0b"
                        : "#3b82f6",
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <TypeIcon
                            className={`h-4 w-4 ${
                              notice.type === "urgent"
                                ? "text-red-500"
                                : notice.type === "important"
                                ? "text-amber-500"
                                : "text-blue-500"
                            }`}
                          />
                          <Badge className={getTypeColor(notice.type)}>
                            {notice.type}
                          </Badge>
                          {!notice.isRead && (
                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                          )}
                        </div>
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {notice.title}
                        </CardTitle>
                        <CardDescription className="mt-2 text-sm leading-relaxed">
                          {truncateContent(notice.content)}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{notice.createdBy}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(notice.publishedAt)}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {notice.scope.toLowerCase()}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedNotice(notice)}
                        className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Read More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Notice Detail Modal */}
      <Dialog
        open={!!selectedNotice}
        onOpenChange={() => setSelectedNotice(null)}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          {selectedNotice && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  {(() => {
                    const TypeIcon = getTypeIcon(selectedNotice.type);
                    return (
                      <TypeIcon
                        className={`h-5 w-5 ${
                          selectedNotice.type === "urgent"
                            ? "text-red-500"
                            : selectedNotice.type === "important"
                            ? "text-amber-500"
                            : "text-blue-500"
                        }`}
                      />
                    );
                  })()}
                  <Badge className={getTypeColor(selectedNotice.type)}>
                    {selectedNotice.type}
                  </Badge>
                  <Badge variant="outline">
                    {selectedNotice.scope.toLowerCase()}
                  </Badge>
                </div>
                <DialogTitle className="text-xl leading-relaxed">
                  {selectedNotice.title}
                </DialogTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{selectedNotice.createdBy}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(
                        selectedNotice.publishedAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </DialogHeader>
              <DialogDescription className="text-base leading-relaxed whitespace-pre-wrap">
                {selectedNotice.content}
              </DialogDescription>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelectedNotice(null)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
