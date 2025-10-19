import { useState, useEffect } from "react";
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
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import {
  dataService,
  Notice,
  NoticeType,
  getTypeIcon,
  getTypeColor,
  formatDate,
  truncateContent,
} from "@/services/dataService";
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

export default function Notices() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [activeTab, setActiveTab] = useState("All");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  const canCreateNotice =
    user?.role && ["FACULTY", "HOD", "DEAN", "ADMIN"].includes(user.role);

  // Load notices from centralized service
  useEffect(() => {
    const loadNotices = async () => {
      try {
        setLoading(true);
        const allNotices = await dataService.getNotices();
        setNotices(allNotices);
      } catch (error) {
        console.error("Error loading notices:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNotices();
  }, []);

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
      case "All":
        return searchedNotices.sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
        );
      case "my-dept":
        return searchedNotices.filter(
          (n) => n.scope === "DEPARTMENT" || n.scope === "GLOBAL"
        );
      default:
        return searchedNotices;
    }
  };

  const currentTabNotices = getTabNotices(activeTab);

  const handleCreateNotice = () => {
    console.log("Creating notice");
    setIsCreateOpen(false);
  };

  if (loading) {
    return (
      <div className="space-y-2 p-3 md:p-6">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-lg mb-6"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-xl mb-6"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
            <DialogContent className="max-w-[calc(100vw-32px)] sm:max-w-[600px] !left-4 !right-4 !translate-x-0 sm:!left-1/2 sm:!right-auto sm:!translate-x-[-50%]">
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
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notices"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 border-2 border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-900/80 focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 dark:focus:border-blue-400 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-2"
      >
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger
            value="All"
            className="flex flex-row items-center gap-1 py-2 px-1"
          >
            <AlarmClock className="h-4 w-4" />
            <span className="text-xs sm:text-sm">All</span>
          </TabsTrigger>
          <TabsTrigger
            value="my-dept"
            className="flex flex-row items-center gap-1 py-2 px-1 "
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
                          <Badge
                            variant="outline"
                            className="text-xs bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-2"
                          >
                            {notice.scope.toLowerCase()}
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
                          <User className="h-3 w-3 text-blue-500" />
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {notice.createdBy}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-green-500" />
                          <span className="text-green-600 dark:text-green-400">
                            {formatDate(notice.publishedAt)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedNotice(notice)}
                        className="group/btn hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30 dark:hover:text-blue-400 border border-primary hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200 border-radius-md"
                      >
                        <Eye className="h-4 w-4 mr-1 group-hover/btn:scale-110 transition-transform duration-200" />
                        <span className="font-medium">Read More</span>
                        <ArrowRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
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
        <DialogContent className="max-w-[calc(100vw-32px)] sm:max-w-[700px] max-h-[80vh] overflow-y-auto !left-4 !right-4 !translate-x-0 sm:!left-1/2 sm:!right-auto sm:!translate-x-[-50%] rounded-lg">
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
                  <Badge
                    variant="outline"
                    className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1"
                  >
                    {selectedNotice.scope.toLowerCase()}
                  </Badge>
                </div>
                <DialogTitle className="text-xl leading-relaxed">
                  {selectedNotice.title}
                </DialogTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4 text-blue-500" />
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {selectedNotice.createdBy}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 dark:text-green-400">
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
                {/* <Button
                  variant="outline"
                  onClick={() => setSelectedNotice(null)}
                >
                  Close
                </Button> */}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
