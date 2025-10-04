import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/Card';

export const Courses: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <p className="text-gray-600">
          Access your enrolled courses and materials
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Course management coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};
