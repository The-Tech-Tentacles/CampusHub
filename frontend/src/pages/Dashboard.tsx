import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Bell, FileText, BookOpen, Users } from 'lucide-react';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, John!
        </h1>
        <p className="text-gray-600">
          Here's what's happening at your university today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Notices</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Pending Forms
                </p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Courses
                </p>
                <p className="text-2xl font-bold text-gray-900">6</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Attendance</p>
                <p className="text-2xl font-bold text-gray-900">85%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Notices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Important: Mid-term exam schedule
                    </p>
                    <p className="text-sm text-gray-500">
                      Computer Science Department
                    </p>
                    <p className="text-xs text-gray-400">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                View All Notices
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-shrink-0">
                    <div className="text-center">
                      <p className="text-sm font-bold text-primary-600">Oct</p>
                      <p className="text-lg font-bold text-gray-900">15</p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Data Structures Lab
                    </p>
                    <p className="text-sm text-gray-500">
                      Room 301, CS Building
                    </p>
                    <p className="text-xs text-gray-400">10:00 AM - 12:00 PM</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                View Schedule
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
