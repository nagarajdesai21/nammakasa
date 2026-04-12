import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, AlertCircle, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { WasteAuto } from '../../types';
import useAuthStore from '../../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AddAutoPage() {
  
  const admin = useAuthStore((state) => state.admin);
  const [autos, setAutos] = useState<WasteAuto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    autoNumber: '',
    registrationNumber: '',
    capacity: '12',
    purchaseDate: '',
    condition: 'good',
    fuelType: 'petrol',
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch autos from backend on mount and when page changes
  useEffect(() => {
    fetchAutos();
  }, [currentPage]);

  const fetchAutos = async () => {
    try {
      setIsFetching(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(
        `${API_URL}/api/admin/autos?page=${currentPage}&limit=${itemsPerPage}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch autos');
      }

      const data = await response.json();
      setAutos(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalItems(data.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching autos:', err);
      setError('Failed to load autos');
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? Number(value) : value,
    }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.autoNumber || !formData.registrationNumber) {
      setError('Auto Number and RC Number are required');
      return false;
    }

    if (formData.capacity && (Number(formData.capacity) <= 0 || Number(formData.capacity) > 30)) {
      setError('Capacity must be between 1 and 30 tons');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');

      if (editingId) {
        // Update auto
        const response = await fetch(`${API_URL}/api/admin/autos/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            autoNumber: formData.autoNumber,
            registrationNumber: formData.registrationNumber,
            capacity: Number(formData.capacity) || 12,
            purchaseDate: formData.purchaseDate,
            condition: formData.condition,
            fuelType: formData.fuelType,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update auto');
        }

        setSuccessMessage('Auto updated successfully!');
        setEditingId(null);
      } else {
        // Create new auto
        const response = await fetch(`${API_URL}/api/admin/autos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            autoNumber: formData.autoNumber,
            registrationNumber: formData.registrationNumber,
            capacity: Number(formData.capacity) || 12,
            purchaseDate: formData.purchaseDate,
            condition: formData.condition,
            fuelType: formData.fuelType,
            wardNo: admin?.wardNo,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create auto');
        }

        setSuccessMessage('Auto added successfully!');
      }

      // Refresh list
      await fetchAutos();

      setFormData({
        autoNumber: '',
        registrationNumber: '',
        capacity: '12',
        purchaseDate: '',
        condition: 'good',
        fuelType: 'petrol',
      });
      setShowForm(false);

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (auto: WasteAuto) => {
    setFormData({
      autoNumber: auto.autoNumber,
      registrationNumber: auto.registrationNumber,
      capacity: auto.capacity?.toString() || '12',
      purchaseDate: auto.purchaseDate,
      condition: auto.condition,
      fuelType: auto.fuelType,
    });
    setEditingId(auto.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this auto?')) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_URL}/api/admin/autos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete auto');
      }

      setSuccessMessage('Auto deleted successfully!');
      await fetchAutos();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete auto');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAutos = autos.filter((auto) =>
    auto.autoNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    auto.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Waste Management Autos</h1>
        <p className="text-gray-600 mt-2">Manage vehicles for Ward {admin?.wardNo}</p>
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
                  autoNumber: '',
                  registrationNumber: '',
                  capacity: '12',
                  purchaseDate: '',
                  condition: 'good',
                  fuelType: 'petrol',
                });
                setError('');
              }}
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              <span>{showForm ? 'Cancel' : 'Add New Auto'}</span>
            </button>

            {/* Quick Stats */}
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-gray-600 text-sm">Total Autos</p>
                <p className="text-3xl font-bold text-karnataka-primary">{totalItems}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {autos.filter((a) => a.status === 'active').length}
                </p>
              </div>
              {autos.length > 0 && (
                <div>
                  <p className="text-gray-600 text-sm">Average Capacity</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(autos.reduce((sum, a) => sum + a.capacity, 0) / autos.length).toFixed(1)} tons
                  </p>
                </div>
              )}
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
                {editingId ? 'Edit Auto' : 'Add New Auto'}
              </h3>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Auto Number */}
                  <div>
                    <label className="label">Auto Registration Number *</label>
                    <input
                      type="text"
                      name="autoNumber"
                      value={formData.autoNumber}
                      onChange={handleChange}
                      placeholder="e.g. KA-01-AB-1234"
                      className="input-field"
                    />
                  </div>

                  {/* Registration Number */}
                  <div>
                    <label className="label">RC Number *</label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      placeholder="e.g. DL01AB0001"
                      className="input-field"
                    />
                  </div>

                  {/* Capacity */}
                  <div>
                    <label className="label">Capacity (Tons) [Optional, Default: 12]</label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      placeholder="e.g. 12"
                      min="1"
                      max="30"
                      className="input-field"
                    />
                  </div>

                  {/* Purchase Date */}
                  <div>
                    <label className="label">Purchase Date [Optional]</label>
                    <input
                      type="date"
                      name="purchaseDate"
                      value={formData.purchaseDate}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="label">Condition</label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>

                  {/* Fuel Type */}
                  <div>
                    <label className="label">Fuel Type [Optional, Default: Petrol]</label>
                    <select
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="cng">CNG</option>
                      <option value="electric">Electric</option>
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex space-x-3 pt-4">
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="btn-primary flex-1 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      editingId ? 'Update Auto' : 'Add Auto'
                    )}
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
                placeholder="Search by auto number or registration..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Autos List */}
          <div className="space-y-4">
            {isFetching ? (
              <div className="card text-center py-12">
                <div className="flex items-center justify-center space-x-2">
                  <Loader className="w-5 h-5 animate-spin text-karnataka-primary" />
                  <p className="text-gray-500">Loading autos...</p>
                </div>
              </div>
            ) : filteredAutos.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-500">No autos found</p>
              </div>
            ) : (
              filteredAutos.map((auto) => (
                <div key={auto.id} className="card hover:shadow-lg transition-shadow">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-gray-500 text-xs font-semibold">AUTO NUMBER</p>
                      <p className="text-lg font-bold text-gray-900">{auto.autoNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-semibold">CAPACITY</p>
                      <p className="text-lg font-bold text-karnataka-primary">{auto.capacity} tons</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-semibold">TYPE</p>
                      <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full capitalize">
                        {auto.type || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-semibold">STATUS</p>
                      <span
                        className={`inline-block mt-1 px-3 py-1 text-sm rounded-full ${
                          auto.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {auto.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-gray-500 text-xs">RC Number</p>
                      <p className="text-gray-900 text-sm font-medium">{auto.registrationNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Fuel Type</p>
                      <p className="text-gray-900 text-sm font-medium capitalize">{auto.fuelType}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Condition</p>
                      <p className="text-gray-900 text-sm font-medium capitalize">{auto.condition}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(auto)}
                        disabled={isLoading}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span className="text-sm">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(auto.id)}
                        disabled={isLoading}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700 disabled:opacity-50"
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="card flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span> | Total: <span className="font-bold">{totalItems}</span> autos
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || isFetching}
                  className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-sm">Previous</span>
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || isFetching}
                  className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
}
