import { useState } from 'react';
import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { MapPin, Eye, List, BarChart3 } from 'lucide-react';
import useAuthStore from '../../store/authStore';

// Mock data for visualization
const pincodeAutoMapping = [
  { pincode: '560038', autos: 5, routes: 2, completionRate: 92 },
  { pincode: '560039', autos: 4, routes: 2, completionRate: 88 },
  { pincode: '560040', autos: 6, routes: 3, completionRate: 95 },
  { pincode: '560041', autos: 3, routes: 1, completionRate: 85 },
  { pincode: '560042', autos: 4, routes: 2, completionRate: 90 },
];

const routeAutoAssignments = [
  { routeName: 'Indiranagar North', assignedAutos: 3, capacity: 30, utilizationRate: 92 },
  { routeName: 'Indiranagar South', assignedAutos: 2, capacity: 20, utilizationRate: 88 },
  { routeName: 'Koramangala', assignedAutos: 4, capacity: 42, utilizationRate: 95 },
  { routeName: 'Whitefield', assignedAutos: 2, capacity: 24, utilizationRate: 85 },
  { routeName: 'Bellandur', assignedAutos: 3, capacity: 32, utilizationRate: 90 },
];

const collectionByPincode = [
  { pincode: '560038', collected: 450, pending: 20 },
  { pincode: '560039', collected: 380, pending: 30 },
  { pincode: '560040', collected: 520, pending: 15 },
  { pincode: '560041', collected: 290, pending: 35 },
  { pincode: '560042', collected: 410, pending: 25 },
];

const autoCapacityUtilization = [
  { auto: 'Auto #101', utilized: 9.6, capacity: 12 },
  { auto: 'Auto #102', utilized: 8.8, capacity: 10 },
  { auto: 'Auto #103', utilized: 10.8, capacity: 12 },
  { auto: 'Auto #104', utilized: 8.5, capacity: 10 },
  { auto: 'Auto #105', utilized: 9.2, capacity: 12 },
];

const routePerformance = [
  { routeName: 'IN-01', collections: 120, avgTime: 125, status: 'excellent' },
  { routeName: 'IN-02', collections: 95, avgTime: 92, status: 'good' },
  { routeName: 'KO-01', collections: 145, avgTime: 138, status: 'excellent' },
  { routeName: 'WF-01', collections: 75, avgTime: 95, status: 'good' },
  { routeName: 'BE-01', collections: 110, avgTime: 120, status: 'excellent' },
];

const wardCoverageData = [
  { name: 'Coverage', value: 85 },
  { name: 'Pending', value: 15 },
];

const COLORS = {
  coverage: '#00A86B',
  pending: '#FF6B00',
  primary: '#FF6B00',
  secondary: '#003D82',
  accent: '#00A86B',
};

export default function VisualMappingPage() {
  const admin = useAuthStore((state) => state.admin);
  const [viewMode, setViewMode] = useState<'maps' | 'list' | 'charts'>('maps');
  const [selectedPincode, setSelectedPincode] = useState('560038');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Visual Mapping & Analytics</h1>
        <p className="text-gray-600 mt-2">
          Relationship visualization: Pincode → Routes → Autos | Ward {admin?.wardNo}
        </p>
      </div>

      {/* View Mode Switcher */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setViewMode('maps')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
            viewMode === 'maps'
              ? 'bg-karnataka-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span>Map View</span>
        </button>
        <button
          onClick={() => setViewMode('charts')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
            viewMode === 'charts'
              ? 'bg-karnataka-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span>Charts</span>
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
            viewMode === 'list'
              ? 'bg-karnataka-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <List className="w-5 h-5" />
          <span>Data</span>
        </button>
      </div>

      {/* Map View */}
      {viewMode === 'maps' && (
        <div className="space-y-6">
          {/* Pincode Selection */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Select Pincode to View</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {pincodeAutoMapping.map((item) => (
                <button
                  key={item.pincode}
                  onClick={() => setSelectedPincode(item.pincode)}
                  className={`p-3 rounded-lg border-2 transition-colors font-semibold ${
                    selectedPincode === item.pincode
                      ? 'border-karnataka-primary bg-orange-50'
                      : 'border-gray-200 hover:border-karnataka-primary'
                  }`}
                >
                  <div className="text-sm text-gray-600">Pincode</div>
                  <div className="text-xl font-bold text-gray-900">{item.pincode}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.autos} Autos</div>
                </button>
              ))}
            </div>
          </div>

          {/* Map Container - Mock Visual */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Pincode {selectedPincode} - Routes & Autos Mapping
            </h3>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 h-96 flex items-center justify-center border-2 border-dashed border-blue-300">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700">
                  Map View - Pincode {selectedPincode}
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  Interactive map location would be displayed here using Leaflet/Mapbox
                </p>
                <div className="mt-6 space-y-2 text-left inline-block">
                  <p className="text-sm">
                    <strong>Routes:</strong> Indiranagar North, Indiranagar South
                  </p>
                  <p className="text-sm">
                    <strong>Assigned Autos:</strong> KA-01-AB-1234, KA-01-AB-1235, KA-01-AB-1236
                  </p>
                  <p className="text-sm">
                    <strong>Collection Status:</strong> 450 units collected, 20 pending
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pincode Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Autos Assigned', value: '5', color: 'blue' },
              { label: 'Routes', value: '2', color: 'green' },
              { label: 'Collections', value: '450', color: 'orange' },
              { label: 'Completion Rate', value: '92%', color: 'purple' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`card bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 border-${stat.color}-200`}
              >
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className={`text-3xl font-bold text-${stat.color}-600 mt-2`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts View */}
      {viewMode === 'charts' && (
        <div className="space-y-6">
          {/* Pincode to Auto Mapping */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Pincode to Auto Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pincodeAutoMapping}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="pincode" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="autos" fill={COLORS.primary} name="Autos" />
                <Bar dataKey="routes" fill={COLORS.accent} name="Routes" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Route Auto Assignments */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Route Auto Assignments & Capacity
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={routeAutoAssignments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="routeName" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="assignedAutos" fill={COLORS.primary} name="Assigned Autos" />
                <Bar dataKey="capacity" fill={COLORS.secondary} name="Total Capacity (tons)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Collection Performance */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Collection Performance by Pincode
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={collectionByPincode}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="pincode" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="collected" fill={COLORS.accent} name="Collected (units)" />
                <Bar dataKey="pending" fill="#FF6B00" name="Pending (units)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Auto Capacity Utilization */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Auto Capacity Utilization
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={autoCapacityUtilization}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="auto" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="utilized" fill={COLORS.primary} name="Utilized (tons)" />
                <Bar dataKey="capacity" fill="#ddd" name="Total Capacity (tons)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Route Performance */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Route Performance Metrics
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={routePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="routeName" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="collections"
                  stroke={COLORS.primary}
                  name="Collections"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgTime"
                  stroke={COLORS.secondary}
                  name="Avg Time (mins)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Ward Coverage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Ward Coverage Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={wardCoverageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill={COLORS.accent} />
                    <Cell fill={COLORS.primary} />
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card flex flex-col justify-center">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Key Performance Indicators</h3>
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-3">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-gray-700">Overall Collection Rate</p>
                    <p className="text-2xl font-bold text-karnataka-accent">85%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-karnataka-accent h-2 rounded-full w-[85%]"></div>
                  </div>
                </div>
                <div className="border-b border-gray-200 pb-3">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-gray-700">Fleet Utilization</p>
                    <p className="text-2xl font-bold text-karnataka-primary">92%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-karnataka-primary h-2 rounded-full w-[92%]"></div>
                  </div>
                </div>
                <div className="pb-3">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-gray-700">Route Efficiency</p>
                    <p className="text-2xl font-bold text-karnataka-secondary">88%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-karnataka-secondary h-2 rounded-full w-[88%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Pincode to Auto Mapping Table */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Pincode to Auto & Route Mapping
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Pincode
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Autos Assigned
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Routes
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Completion Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pincodeAutoMapping.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{item.pincode}</td>
                      <td className="px-4 py-3 text-gray-700">{item.autos}</td>
                      <td className="px-4 py-3 text-gray-700">{item.routes}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-karnataka-accent h-2 rounded-full"
                              style={{ width: `${item.completionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {item.completionRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Route Auto Assignments Table */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Route Auto Assignments</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Route Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Assigned Autos
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Total Capacity
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Utilization
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {routeAutoAssignments.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{item.routeName}</td>
                      <td className="px-4 py-3 text-gray-700">{item.assignedAutos}</td>
                      <td className="px-4 py-3 text-gray-700">{item.capacity} tons</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-karnataka-primary h-2 rounded-full"
                              style={{ width: `${item.utilizationRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {item.utilizationRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Auto Capacity Table */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Auto Capacity Utilization</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Auto Number
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Utilized
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Capacity
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {autoCapacityUtilization.map((item, idx) => {
                    const percentage = ((item.utilized / item.capacity) * 100).toFixed(1);
                    return (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{item.auto}</td>
                        <td className="px-4 py-3 text-gray-700">{item.utilized} tons</td>
                        <td className="px-4 py-3 text-gray-700">{item.capacity} tons</td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {percentage}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
