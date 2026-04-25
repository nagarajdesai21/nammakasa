import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
  MessageCircle,
  AlertTriangle,
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

const mockActiveComplaints = [
  { id: 1, issue: 'Garbage overflow on Indiranagar North', date: '2024-12-25', status: 'Pending' },
  { id: 2, issue: 'Overflowing bins near market area', date: '2024-12-24', status: 'In Progress' },
  { id: 3, issue: 'Collection not done in Koramangala zone', date: '2024-12-23', status: 'Pending' },
  { id: 4, issue: 'Vehicle delayed beyond scheduled time', date: '2024-12-22', status: 'In Progress' },
  { id: 5, issue: 'Unauthorized dumping near residential area', date: '2024-12-21', status: 'Pending' },
];

const mockSolvedComplaints = [
  { id: 101, issue: 'Garbage overflow on Whitefield road', resolvedDate: '2024-12-20', resolvedIn: '4 hours' },
  { id: 102, issue: 'Missing collection in Ward 46', resolvedDate: '2024-12-19', resolvedIn: '2 hours' },
  { id: 103, issue: 'Spillage during collection', resolvedDate: '2024-12-18', resolvedIn: '3 hours' },
  { id: 104, issue: 'Vehicle parked on road blocking traffic', resolvedDate: '2024-12-17', resolvedIn: '1 hour' },
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
  const activeComplaints = mockActiveComplaints;
  const solvedComplaints = mockSolvedComplaints;
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
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
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

      {/* Complaints Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Active Complaints */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Active Complaints
            </h3>
            <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
              {activeComplaints.length}
            </div>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activeComplaints.map((complaint) => (
              <div key={complaint.id} className="border-l-4 border-red-500 pl-3 py-2">
                <p className="text-sm font-medium text-gray-900">{complaint.issue}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">{complaint.date}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    complaint.status === 'In Progress' 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {complaint.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Solved Complaints */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Resolved Complaints
            </h3>
            <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-semibold">
              {solvedComplaints.length}
            </div>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {solvedComplaints.map((complaint) => (
              <div key={complaint.id} className="border-l-4 border-green-500 pl-3 py-2">
                <p className="text-sm font-medium text-gray-900">{complaint.issue}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">Resolved: {complaint.resolvedDate}</span>
                  <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                    {complaint.resolvedIn}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
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
