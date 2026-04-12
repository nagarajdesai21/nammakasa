import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, AlertCircle, Loader} from 'lucide-react';
import { Driver } from '../../types';
import useAuthStore from '../../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AddDriverPage() {
  const admin = useAuthStore((state) => state.admin);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    yearsOfService: '',
    salary: '',
    licenseNumber: '',
    licenseExpiry: '',
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch drivers on mount and when page changes
  useEffect(() => {
    fetchDrivers();
  }, [currentPage]);

  const fetchDrivers = async () => {
    try {
      setIsFetching(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(
        `${API_URL}/api/admin/drivers?page=${currentPage}&limit=${itemsPerPage}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch drivers');
      }

      const data = await response.json();
      setDrivers(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalItems(data.pagination?.total || 0);
      setError('');
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch drivers');
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' || name === 'yearsOfService' || name === 'salary' ? 
        (value ? Number(value) : '') : value,
    }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.name || !formData.phone || !formData.age) {
      setError('Please fill in all required fields');
      return false;
    }

    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      setError('Phone number must be 10 digits');
      return false;
    }

    if (Number(formData.age) < 18 || Number(formData.age) > 70) {
      setError('Age must be between 18 and 70');
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

      if (!token) {
        setError('No authentication token found');
        return;
      }

      const payload = {
        name: formData.name,
        phone: formData.phone,
        age: Number(formData.age),
        yearsOfService: formData.yearsOfService ? Number(formData.yearsOfService) : null,
        salary: formData.salary ? Number(formData.salary) : null,
        licenseNumber: formData.licenseNumber || null,
        licenseExpiry: formData.licenseExpiry || null,
      };

      if (editingId) {
        // Update driver
        const response = await fetch(`${API_URL}/api/admin/drivers/${editingId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Failed to update driver');
        }

        setSuccessMessage('Driver updated successfully!');
        setEditingId(null);
      } else {
        // Create new driver
        const response = await fetch(`${API_URL}/api/admin/drivers`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create driver');
        }

        setSuccessMessage('Driver added successfully!');
      }

      // Reset form and refresh list
      setFormData({
        name: '',
        age: '',
        phone: '',
        yearsOfService: '',
        salary: '',
        licenseNumber: '',
        licenseExpiry: '',
      });
      setShowForm(false);
      setError('');

      // Refresh drivers list
      await fetchDrivers();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (driver: Driver) => {
    setFormData({
      name: driver.name,
      age: driver.age.toString(),
      phone: driver.phone,
      yearsOfService: driver.yearsOfService?.toString() || '',
      salary: driver.salary?.toString() || '',
      licenseNumber: driver.licenseNumber || '',
      licenseExpiry: driver.licenseExpiry || '',
    });
    setEditingId(driver.id);
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this driver?')) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');

      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/drivers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete driver');
      }

      setSuccessMessage('Driver deleted successfully!');
      
      // Refresh drivers list
      await fetchDrivers();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete driver');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDrivers = drivers.filter((driver) =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Driver Management</h1>
        <p className="text-gray-600 mt-2">Manage drivers for Ward {admin?.wardNo}</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 flex items-center space-x-3">
          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);
                setFormData({
                  name: '',
                  age: '',
                  phone: '',
                  yearsOfService: '',
                  salary: '',
                  licenseNumber: '',
                  licenseExpiry: '',
                });
                setError('');
              }}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>{showForm ? 'Cancel' : 'Add Driver'}</span>
            </button>

            {/* Quick Stats */}
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-gray-600 text-sm">Total Drivers</p>
                <p className="text-3xl font-bold text-karnataka-primary">{totalItems}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {drivers.filter((d) => d.status === 'active').length}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Avg Experience</p>
                <p className="text-2xl font-bold text-blue-600">
                  {drivers.length > 0 
                    ? (drivers.reduce((sum, d) => sum + (d.yearsOfService || 0), 0) / drivers.length).toFixed(1)
                    : '0'} yrs
                </p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-gray-600 text-xs">
                  Page {currentPage} of {totalPages}
                </p>
                <p className="text-gray-600 text-xs">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Form */}
          {showForm && (
            <div className="card bg-blue-50 border border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editingId ? 'Edit Driver' : 'Add New Driver'}
              </h3>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Required Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Rajesh Kumar"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="label">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="label">Age *</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="45"
                      min="18"
                      max="70"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="label">Years of Service</label>
                    <input
                      type="number"
                      name="yearsOfService"
                      value={formData.yearsOfService}
                      onChange={handleChange}
                      placeholder="Optional"
                      min="0"
                      max="50"
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Optional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Salary (Monthly)</label>
                    <input
                      type="number"
                      name="salary"
                      value={formData.salary}
                      onChange={handleChange}
                      placeholder="Optional"
                      min="0"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="label">License Number</label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      placeholder="Optional"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="label">License Expiry Date</label>
                    <input
                      type="date"
                      name="licenseExpiry"
                      value={formData.licenseExpiry}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex space-x-3 pt-4">
                  <button 
                    type="submit" 
                    className="btn-primary flex-1 flex items-center justify-center space-x-2"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                    <span>{editingId ? 'Update Driver' : 'Add Driver'}</span>
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
                placeholder="Search by name, phone or license number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Loading State */}
          {isFetching ? (
            <div className="card text-center py-12">
              <div className="flex items-center justify-center space-x-2">
                <Loader className="w-5 h-5 animate-spin text-karnataka-primary" />
                <span className="text-gray-600">Loading drivers...</span>
              </div>
            </div>
          ) : (
            /* Drivers List */
            <div className="space-y-4">
              {filteredDrivers.length === 0 ? (
                <div className="card text-center py-12">
                  <p className="text-gray-500">{drivers.length === 0 ? 'No drivers yet. Add one to get started!' : 'No drivers found'}</p>
                </div>
              ) : (
                filteredDrivers.map((driver) => (
                  <div key={driver.id} className="card hover:shadow-lg transition-shadow">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-gray-500 text-xs font-semibold">NAME</p>
                        <p className="text-lg font-bold text-gray-900">{driver.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-semibold">PHONE</p>
                        <p className="text-lg font-bold text-karnataka-primary">{driver.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-semibold">AGE</p>
                        <p className="text-lg font-bold text-gray-900">{driver.age} years</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-semibold">STATUS</p>
                        <span
                          className={`inline-block mt-1 px-3 py-1 text-sm rounded-full ${
                            driver.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {driver.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 lg:grid-cols-5 gap-4">
                      <div>
                        <p className="text-gray-500 text-xs">Experience</p>
                        <p className="text-gray-900 text-sm font-medium">
                          {driver.yearsOfService || '-'} years
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Salary</p>
                        <p className="text-gray-900 text-sm font-medium">
                          {driver.salary ? `₹${driver.salary}` : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">License</p>
                        <p className="text-gray-900 text-sm font-medium text-ellipsis overflow-hidden">
                          {driver.licenseNumber ? driver.licenseNumber.substring(0, 8) + '...' : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Expiry</p>
                        <p className="text-gray-900 text-sm font-medium">
                          {driver.licenseExpiry
                            ? new Date(driver.licenseExpiry).toLocaleDateString('en-IN')
                            : '-'}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(driver)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="text-sm">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(driver.id)}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-sm">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}