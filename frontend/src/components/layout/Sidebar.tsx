import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Bell,
  FileText,
  BookOpen,
  MessageSquare,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '../../utils/cn';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Notices', href: '/notices', icon: Bell },
  { name: 'Forms', href: '/forms', icon: FileText },
  { name: 'Courses', href: '/courses', icon: BookOpen },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Profile', href: '/profile', icon: User },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-600">🎓 CampusHub</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3 space-y-1">
        <Link
          to="/settings"
          className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </Link>
        <button className="flex w-full items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};
