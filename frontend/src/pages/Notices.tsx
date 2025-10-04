import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/Card';

export const Notices: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notices</h1>
        <p className="text-gray-600">
          Stay updated with the latest announcements
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Notices</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Notice management coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};
