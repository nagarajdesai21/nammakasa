import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Truck,
  Users,
  MapPin,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// MOCK DATA - Comment/uncomment to switch between mock and real data
const mockCollectionData = [
  { day: 'Mon', completed: 240, pending: 60 },
  { day: 'Tue', completed: 280, pending: 40 },
  { day: 'Wed', completed: 320, pending: 20 },
  { day: 'Thu', completed: 250, pending: 45 },
  { day: 'Fri', completed: 290, pending: 35 },
  { day: 'Sat', completed: 210, pending: 50 },
  { day: 'Sun', completed: 180, pending: 60 },
];

const mockAutoTypeData = [
  { name: 'Compactor', value: 45, color: '#FF6B00' },
  { name: 'Tipper', value: 32, color: '#003D82' },
  { name: 'Tractor', value: 23, color: '#00A86B' },
];

const mockWardData = [
  { ward: '45', autos: 12, drivers: 15, routes: 8 },
  { ward: '46', autos: 10, drivers: 13, routes: 7 },
  { ward: '47', autos: 14, drivers: 18, routes: 9 },
  { ward: '48', autos: 11, drivers: 14, routes: 8 },
  { ward: '49', autos: 13, drivers: 16, routes: 8 },
];

export default function Dashboard() {
  const admin = useAuthStore((state) => state.admin);
  const [stats, setStats] = useState({
    totalAutos: 127,
    activeAutos: 98,
    totalDrivers: 145,
    totalRoutes: 52,
    completedCollections: 1873,
    pendingCollections: 234,
    completionRate: 89,
  });

  // Use mock data (currently enabled)
  const collectionData = mockCollectionData;
  const autoTypeData = mockAutoTypeData;
  const wardData = mockWardData;

  // TODO: To fetch from real API, uncomment below and comment out mock data above:
  /*
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        // Fetch stats
        const statsResponse = await fetch(`${API_URL}/api/admin/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const statsData = await statsResponse.json();
        setStats(statsData);
        
        // Fetch collection trends
        const trendResponse = await fetch(`${API_URL}/api/admin/dashboard/collection-trends`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const trendData = await trendResponse.json();
        setCollectionData(trendData);
        
        // Fetch auto types
        const autoResponse = await fetch(`${API_URL}/api/admin/dashboard/auto-types`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const autoData = await autoResponse.json();
        setAutoTypeData(autoData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Fallback to mock data on error
      }
    };
    
    fetchDashboardData();
  }, []);
  */

  useEffect(() => {
    // Mock data is loaded by default
    // Real API calls can be enabled above
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome back, {admin?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">Ward {admin?.wardNo} | Manage your waste collection operations</p>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Autos */}
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Autos</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalAutos}
              </h3>
              <p className="text-green-600 text-xs mt-2 flex items-center space-x-1">
                <span>✓</span>
                <span>{stats.activeAutos} Active</span>
              </p>
            </div>
            <div className="bg-blue-200 p-3 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Drivers */}
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Drivers</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalDrivers}
              </h3>
              <p className="text-green-600 text-xs mt-2">All verified</p>
            </div>
            <div className="bg-green-200 p-3 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Routes */}
        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Routes</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalRoutes}
              </h3>
              <p className="text-orange-600 text-xs mt-2">Active routes</p>
            </div>
            <div className="bg-orange-200 p-3 rounded-lg">
              <MapPin className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completion Rate</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {stats.completionRate}%
              </h3>
              <p className="text-purple-600 text-xs mt-2 flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>+5% from last week</span>
              </p>
            </div>
            <div className="bg-purple-200 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Collection Trend */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Weekly Collection Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={collectionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#00A86B" name="Completed" />
              <Bar dataKey="pending" fill="#FF6B00" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Auto Type Distribution */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Auto Type Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={autoTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {autoTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ward-wise Statistics */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Ward-wise Overview
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={wardData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ward" label={{ value: 'Ward Number', position: 'insideBottom', offset: -5 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="autos" fill="#FF6B00" name="Autos" />
            <Bar dataKey="drivers" fill="#003D82" name="Drivers" />
            <Bar dataKey="routes" fill="#00A86B" name="Routes" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Collection Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Collections Completed</p>
              <h3 className="text-3xl font-bold text-green-600 mt-2">
                {stats.completedCollections}
              </h3>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Collections Pending</p>
              <h3 className="text-3xl font-bold text-orange-600 mt-2">
                {stats.pendingCollections}
              </h3>
            </div>
            <AlertCircle className="w-12 h-12 text-orange-200" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Collections</p>
              <h3 className="text-3xl font-bold text-blue-600 mt-2">
                {stats.completedCollections + stats.pendingCollections}
              </h3>
            </div>
            <Truck className="w-12 h-12 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card mt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: 'Route assigned', auto: 'Auto #101', time: '2 hours ago' },
            { action: 'Driver verified', driver: 'John Doe', time: '4 hours ago' },
            { action: 'Collection completed', route: 'Indiranagar North', time: '6 hours ago' },
            { action: 'New auto added', auto: 'Auto #105', time: '1 day ago' },
          ].map((activity, idx) => (
            <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-karnataka-primary rounded-full"></div>
                <div>
                  <p className="text-gray-900 font-medium text-sm">{activity.action}</p>
                  <p className="text-gray-500 text-xs">
                    {(activity as any).auto || (activity as any).driver || (activity as any).route}
                  </p>
                </div>
              </div>
              <p className="text-gray-500 text-xs ">{activity.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
