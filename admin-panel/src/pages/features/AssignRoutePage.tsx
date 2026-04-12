import { useState, useEffect } from 'react';
import { Plus, Search, AlertCircle, X, Edit2, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { RouteAssignment, WasteAuto, Route, Driver } from '../../types';
import useAuthStore from '../../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AssignRoutePage() {
  const admin = useAuthStore((state) => state.admin);
  
  // Data states
  const [autos, setAutos] = useState<WasteAuto[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [assignments, setAssignments] = useState<RouteAssignment[]>([]);
  
  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Loading/Error states
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    routeId: '',
    autoId: '',
    driverId: '',
    assignmentDate: new Date().toISOString().split('T')[0],
    estimatedCompletionTime: '14:00',
    petrolLitres: '',
    petrolCost: '',
    serviceCharges: '',
  });

  // Fetch all data on mount and when page changes
  useEffect(() => {
    fetchAllData();
  }, [currentPage]);

  const fetchAllData = async () => {
    try {
      setIsFetching(true);
      const token = localStorage.getItem('authToken');

      // Fetch all resources in parallel
      const [autosRes, routesRes, driversRes, assignmentsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/autos?limit=100`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        }),
        fetch(`${API_URL}/api/admin/routes?limit=100`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        }),
        fetch(`${API_URL}/api/admin/drivers?limit=100`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        }),
        fetch(`${API_URL}/api/admin/assignments?page=${currentPage}&limit=${itemsPerPage}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        }),
      ]);

      if (!autosRes.ok || !routesRes.ok || !driversRes.ok) {
        throw new Error('Failed to fetch autos, routes, or drivers');
      }

      const autosData = await autosRes.json();
      const routesData = await routesRes.json();
      const driversData = await driversRes.json();

      setAutos(autosData.data || []);
      setRoutes(routesData.data || []);
      setDrivers(driversData.data || []);

      // Handle assignments separately (may not exist yet)
      if (assignmentsRes.ok) {
        const assignmentsData = await assignmentsRes.json();
        setAssignments(assignmentsData.data || []);
        setTotalPages(assignmentsData.pagination?.pages || 1);
        setTotalItems(assignmentsData.pagination?.total || 0);
      } else {
        setAssignments([]);
        setTotalPages(1);
        setTotalItems(0);
      }

      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.routeId || !formData.autoId || !formData.driverId) {
      setError('Please select route, auto, and driver');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');

      const petrolDetails = formData.petrolLitres
        ? [
            {
              litres: Number(formData.petrolLitres),
              cost: Number(formData.petrolCost) || 0,
              date: formData.assignmentDate,
            },
          ]
        : [];

      const serviceDetails = formData.serviceCharges
        ? [
            {
              description: 'Maintenance Charges',
              cost: Number(formData.serviceCharges),
              date: formData.assignmentDate,
            },
          ]
        : [];

      const payload = {
        routeId: formData.routeId,
        autoId: formData.autoId,
        driverId: formData.driverId,
        assignmentDate: formData.assignmentDate,
        estimatedCompletionTime: formData.estimatedCompletionTime,
        status: 'assigned',
        petrolDetails,
        serviceCharges: serviceDetails,
      };

      const url = editingId
        ? `${API_URL}/api/admin/assignments/${editingId}`
        : `${API_URL}/api/admin/assignments`;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save assignment');
      }

      setSuccessMessage(editingId ? 'Assignment updated successfully!' : 'Route assigned successfully!');

      // Reset form
      setFormData({
        routeId: '',
        autoId: '',
        driverId: '',
        assignmentDate: new Date().toISOString().split('T')[0],
        estimatedCompletionTime: '14:00',
        petrolLitres: '',
        petrolCost: '',
        serviceCharges: '',
      });
      setEditingId(null);
      setShowForm(false);

      // Refresh data
      await fetchAllData();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save assignment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (assignment: RouteAssignment) => {
    setFormData({
      routeId: assignment.routeId,
      autoId: assignment.autoId,
      driverId: assignment.driverId,
      assignmentDate: assignment.assignmentDate,
      estimatedCompletionTime: assignment.estimatedCompletionTime,
      petrolLitres: assignment.petrolDetails?.[0]?.litres.toString() || '',
      petrolCost: assignment.petrolDetails?.[0]?.cost.toString() || '',
      serviceCharges: assignment.serviceCharges?.[0]?.cost.toString() || '',
    });
    setEditingId(assignment.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_URL}/api/admin/assignments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete assignment');
      }

      setSuccessMessage('Assignment deleted successfully!');

      // Refresh data
      await fetchAllData();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete assignment');
    } finally {
      setIsLoading(false);
    }
  };

  const getAutoName = (autoId: string) =>
    autos.find((a) => a.id === autoId)?.autoNumber || 'Unknown';
  const getRouteName = (routeId: string) =>
    routes.find((r) => r.id === routeId)?.routeName || 'Unknown';
  const getDriverName = (driverId: string) =>
    drivers.find((d) => d.id === driverId)?.name || 'Unknown';

  const filteredAssignments = assignments.filter(
    (a) =>
      getAutoName(a.autoId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getRouteName(a.routeId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getDriverName(a.driverId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalAssignments: assignments.length,
    active: assignments.filter((a) => a.status === 'assigned').length,
    completed: assignments.filter((a) => a.status === 'completed').length,
    totalPetrolCost: assignments.reduce(
      (sum, a) => sum + (a.petrolDetails?.reduce((s, p) => s + p.cost, 0) || 0),
      0
    ),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Route Assignments</h1>
        <p className="text-gray-600 mt-2">Assign routes to autos and drivers for Ward {admin?.wardNo}</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 flex items-center space-x-3">
          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <p className="text-gray-600 text-sm">Total Assignments</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalAssignments}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <p className="text-gray-600 text-sm">Active Assignments</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <p className="text-gray-600 text-sm">Completed</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{stats.completed}</p>
        </div>
        <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
          <p className="text-gray-600 text-sm">Total Petrol Cost</p>
          <p className="text-2xl font-bold text-orange-600 mt-2">₹{stats.totalPetrolCost.toFixed(0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);
                setFormData({
                  routeId: '',
                  autoId: '',
                  driverId: '',
                  assignmentDate: new Date().toISOString().split('T')[0],
                  estimatedCompletionTime: '14:00',
                  petrolLitres: '',
                  petrolCost: '',
                  serviceCharges: '',
                });
              }}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>{showForm ? 'Cancel' : 'New Assignment'}</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Form */}
          {showForm && (
            <div className="card bg-blue-50 border border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editingId ? 'Edit Assignment' : 'Create New Assignment'}
              </h3>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Core Assignment */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Select Route *</label>
                    <select
                      name="routeId"
                      value={formData.routeId}
                      onChange={handleChange}
                      className="input-field"
                      disabled={isFetching}
                    >
                      <option value="">Choose a route</option>
                      {routes.map((route) => (
                        <option key={route.id} value={route.id}>
                          {route.routeName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Select Auto *</label>
                    <select
                      name="autoId"
                      value={formData.autoId}
                      onChange={handleChange}
                      className="input-field"
                      disabled={isFetching}
                    >
                      <option value="">Choose an auto</option>
                      {autos.map((auto) => (
                        <option key={auto.id} value={auto.id}>
                          {auto.autoNumber}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Select Driver *</label>
                    <select
                      name="driverId"
                      value={formData.driverId}
                      onChange={handleChange}
                      className="input-field"
                      disabled={isFetching}
                    >
                      <option value="">Choose a driver</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Assignment Date</label>
                    <input
                      type="date"
                      name="assignmentDate"
                      value={formData.assignmentDate}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="label">Estimated Completion Time</label>
                    <input
                      type="time"
                      name="estimatedCompletionTime"
                      value={formData.estimatedCompletionTime}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Optional: Petrol & Service */}
                <div className="border-t border-blue-300 pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Optional: Petrol & Service Management</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">Petrol (Litres)</label>
                      <input
                        type="number"
                        name="petrolLitres"
                        value={formData.petrolLitres}
                        onChange={handleChange}
                        placeholder="Optional"
                        step="0.5"
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="label">Petrol Cost (₹)</label>
                      <input
                        type="number"
                        name="petrolCost"
                        value={formData.petrolCost}
                        onChange={handleChange}
                        placeholder="Optional"
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="label">Service Charges (₹)</label>
                      <input
                        type="number"
                        name="serviceCharges"
                        value={formData.serviceCharges}
                        onChange={handleChange}
                        placeholder="Optional"
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="btn-primary flex-1 flex items-center justify-center space-x-2 disabled:opacity-50" disabled={isLoading}>
                    {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : null}
                    <span>{isLoading ? 'Saving...' : (editingId ? 'Update Assignment' : 'Create Assignment')}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search */}
          <div className="card">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by auto, route, or driver..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Assignments List */}
          <div className="space-y-4">
            {isFetching ? (
              <div className="card text-center py-12">
                <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
                <p className="text-gray-500">Loading assignments...</p>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-500">No assignments found</p>
              </div>
            ) : (
              filteredAssignments.map((assignment) => (
                <div key={assignment.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-3 h-3 bg-karnataka-primary rounded-full"></div>
                        <h4 className="text-lg font-bold text-gray-900">
                          {getRouteName(assignment.routeId)}
                        </h4>
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-semibold ${
                            assignment.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : assignment.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {assignment.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-gray-500 text-xs font-semibold">AUTO</p>
                          <p className="text-gray-900 text-sm font-medium">
                            {getAutoName(assignment.autoId)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-semibold">DRIVER</p>
                          <p className="text-gray-900 text-sm font-medium">
                            {getDriverName(assignment.driverId)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-semibold">DATE</p>
                          <p className="text-gray-900 text-sm font-medium">
                            {new Date(assignment.assignmentDate).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-semibold">COMPLETION TIME</p>
                          <p className="text-gray-900 text-sm font-medium">
                            {assignment.estimatedCompletionTime}
                          </p>
                        </div>
                      </div>

                      {(assignment.petrolDetails || assignment.serviceCharges) && (
                        <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 md:grid-cols-3 gap-3">
                          {assignment.petrolDetails && assignment.petrolDetails.length > 0 && (
                            <div>
                              <p className="text-gray-500 text-xs">Petrol</p>
                              <p className="text-gray-900 text-sm font-medium">
                                {assignment.petrolDetails[0].litres} L | ₹{assignment.petrolDetails[0].cost}
                              </p>
                            </div>
                          )}
                          {assignment.serviceCharges && assignment.serviceCharges.length > 0 && (
                            <div>
                              <p className="text-gray-500 text-xs">Service</p>
                              <p className="text-gray-900 text-sm font-medium">
                                ₹{assignment.serviceCharges[0].cost}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 md:ml-4">
                      <button
                        onClick={() => handleEdit(assignment)}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 px-3 py-2 rounded hover:bg-blue-50"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span className="text-sm">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(assignment.id)}
                        className="flex items-center space-x-2 text-red-600 hover:text-red-700 px-3 py-2 rounded hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                        <span className="text-sm">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Pagination */}
            {!isFetching && totalPages > 1 && (
              <div className="card flex items-center justify-between">
                <p className="text-gray-600 text-sm">
                  Page {currentPage} of {totalPages} • Total: {totalItems} assignments
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || isFetching}
                    className="flex items-center space-x-1 px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-sm">Previous</span>
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || isFetching}
                    className="flex items-center space-x-1 px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="text-sm">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
