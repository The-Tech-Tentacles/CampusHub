import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/Card';

export const Forms: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Forms</h1>
        <p className="text-gray-600">
          Complete and track your application forms
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Forms</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Forms management coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};
