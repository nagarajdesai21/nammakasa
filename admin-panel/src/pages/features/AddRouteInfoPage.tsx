import { useState, useEffect, useRef } from 'react';
import { Search, Edit2, Trash2, AlertCircle, MapPin, X, Save, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { Route } from '../../types';
import useAuthStore from '../../store/authStore';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AddRouteInfoPage() {
  const admin = useAuthStore((state) => state.admin);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMapMode, setShowMapMode] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  
  // Map Mode State
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const drawControlRef = useRef<any>(null);
  const [formData, setFormData] = useState({
    routeName: '',
    routeCode: '',
    pincode: '',
    estimatedDuration: '60',
    frequency: 'daily' as const,
  });
  const [drawnPolygon, setDrawnPolygon] = useState<any>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch routes on mount and when page changes
  useEffect(() => {
    fetchRoutes();
  }, [currentPage]);

  // Fetch routes from backend with pagination
  const fetchRoutes = async () => {
    try {
      setIsFetching(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(
        `${API_URL}/api/admin/routes?page=${currentPage}&limit=${itemsPerPage}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch routes');
      }

      const data = await response.json();
      setRoutes(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalItems(data.pagination?.total || 0);
      setError('');
    } catch (err) {
      console.error('Error fetching routes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch routes');
    } finally {
      setIsFetching(false);
    }
  };

  // Fetch lat/lng and boundary from Nominatim OpenStreetMap API
  const fetchLatLngFromPincode = async (pincode: string) => {
    try {
      setPincodeLoading(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json&polygon_geojson=1`,
        {
          headers: {
            'User-Agent': 'nammakasa-admin-panel',
          },
        }
      );

      const data = await res.json();

      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          geojson: data[0].geojson || null,
        };
      }

      return null;
    } catch (err) {
      console.error('Error fetching location:', err);
      return null;
    } finally {
      setPincodeLoading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (showMapMode && mapRef.current && !mapInstanceRef.current) {
      initializeMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off();
        mapInstanceRef.current = null;
      }
    };
  }, [showMapMode]);

  const initializeMap = () => {
    const map = L.map(mapRef.current).setView([13.0, 77.6], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;

    const drawControl = new (L.Control as any).Draw({
      draw: {
        polygon: true,
        rectangle: false,
        circle: false,
        marker: false,
        polyline: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: drawnItems,
      },
    });
    map.addControl(drawControl);
    drawControlRef.current = drawControl;

    map.on((L as any).Draw.Event.CREATED, function (event: any) {
      const layer = event.layer;
      if (drawnItemsRef.current) {
        drawnItemsRef.current.clearLayers();
        drawnItemsRef.current.addLayer(layer);
        setDrawnPolygon(layer);
      }
    });

    map.on((L as any).Draw.Event.EDITED, function (event: any) {
      const layers = event.layers;
      layers.eachLayer((layer: any) => {
        setDrawnPolygon(layer);
      });
    });

    mapInstanceRef.current = map;
  };

  const handlePincodeChange = async (pincode: string) => {
    setFormData((prev) => ({ ...prev, pincode }));

    if (pincode.length === 6) {
      const result = await fetchLatLngFromPincode(pincode);

      if (result && mapInstanceRef.current) {
        const { lat, lng, geojson } = result;
        
        mapInstanceRef.current.flyTo([lat, lng], 15, {
          animate: true,
          duration: 1.5,
        });

        // Draw boundary if geojson available
        if (geojson) {
          const layer = L.geoJSON(geojson, {
            style: {
              color: 'blue',
              weight: 2,
              fillOpacity: 0.1,
            },
          }).addTo(mapInstanceRef.current);

          // Fit map to boundary
          mapInstanceRef.current.fitBounds(layer.getBounds());
        } else {
          // Fallback: draw circle if no boundary available
          L.circle([lat, lng], {
            radius: 1000,
            color: 'blue',
            weight: 2,
            fillOpacity: 0.1,
          }).addTo(mapInstanceRef.current);
        }

        // Add marker
        L.marker([lat, lng])
          .addTo(mapInstanceRef.current)
          .bindPopup(`Pincode: ${pincode}`)
          .openPopup();

        setError('');
      } else {
        setError(`Pincode ${pincode} not found. Please try another.`);
      }
    }
  };

  const validateMapForm = (): boolean => {
    if (!formData.routeName.trim()) {
      setError('Route name is required');
      return false;
    }

    if (!formData.pincode || formData.pincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return false;
    }

    if (!drawnPolygon) {
      setError('Please draw a route polygon on the map');
      return false;
    }

    return true;
  };

  const handleSaveRoute = async () => {
    if (!validateMapForm()) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');

      const latlngs = drawnPolygon.getLatLngs()[0];
      const coordinates = latlngs.map((p: any) => ({
        lat: p.lat,
        lng: p.lng,
      }));
      coordinates.push(coordinates[0]);

      const autoGenRoutCode = `RT-${admin?.wardNo || 'XX'}-${String(totalItems + 1).padStart(2, '0')}`;
      const payload = {
        routeName: formData.routeName,
        routeCode: autoGenRoutCode,
        pinCodes: [formData.pincode],
        estimatedDuration: Number(formData.estimatedDuration),
        frequency: formData.frequency,
        coordinates,
        description: `Route for ward ${admin?.wardNo}`,
      };

      const response = await fetch(`${API_URL}/api/admin/routes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create route');
      }

      setSuccessMessage('Route created successfully with map coordinates!');

      // Reset form
      setFormData({
        routeName: '',
        routeCode: `RT-${admin?.wardNo || 'XX'}-${String(totalItems + 1).padStart(2, '0')}`,
        pincode: '',
        estimatedDuration: '60',
        frequency: 'daily',
      });
      setDrawnPolygon(null);
      if (drawnItemsRef.current) {
        drawnItemsRef.current.clearLayers();
      }
      setShowMapMode(false);
      setError('');

      // Refresh routes list
      await fetchRoutes();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save route. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRoutes = routes.filter((route) =>
    route.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.routeCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this route?')) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_URL}/api/admin/routes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete route');
      }

      setSuccessMessage('Route deleted successfully!');

      // Refresh routes list
      await fetchRoutes();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete route');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Collection Routes</h1>
        <p className="text-gray-600 mt-2">
          Create routes by drawing on the map for Ward {admin?.wardNo}
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 flex items-center space-x-3">
          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Map Mode */}
      {showMapMode && (
        <div className="mb-8 card bg-blue-50 border-2 border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Create Route on Map</h2>
            <button
              onClick={() => {
                setShowMapMode(false);
                setError('');
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Form */}
            <div className="space-y-4">
              <div>
                <label className="label">Route Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Indiranagar North"
                  value={formData.routeName}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, routeName: e.target.value }));
                    setError('');
                  }}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Route Code (Auto-generated)</label>
                <input
                  type="text"
                  value={formData.routeCode || `RT-${admin?.wardNo || 'XX'}-${String(totalItems + 1).padStart(2, '0')}`}
                  disabled
                  className="input-field bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="label">Pincode * {pincodeLoading && <Loader className="w-4 h-4 inline animate-spin ml-2" />}</label>
                <input
                  type="text"
                  placeholder="560038"
                  value={formData.pincode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    handlePincodeChange(val);
                    setError('');
                  }}
                  maxLength={6}
                  disabled={pincodeLoading}
                  className="input-field disabled:opacity-50"
                />
                <p className="text-gray-500 text-xs mt-1">Map will zoom to pincode location (auto-fetch from Nominatim)</p>
              </div>

              <div>
                <label className="label">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, frequency: e.target.value as any }))
                  }
                  className="input-field"
                >
                  <option value="daily">Daily</option>
                  <option value="alternate">Alternate Days</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div>
                <label className="label">Estimated Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, estimatedDuration: e.target.value }))
                  }
                  min="15"
                  max="480"
                  className="input-field"
                />
              </div>

              <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 text-sm text-blue-700">
                <p className="font-semibold mb-2">📍 Instructions:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Enter pincode to view that area</li>
                  <li>Use map tools to draw route polygon</li>
                  <li>Click Save to create route</li>
                </ol>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveRoute}
                  disabled={isLoading}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  <span>{isLoading ? 'Saving...' : 'Save Route'}</span>
                </button>
              </div>
            </div>

            {/* Right Panel - Map */}
            <div className="lg:col-span-2">
              <div
                ref={mapRef}
                className="rounded-lg border-2 border-gray-200"
                style={{ height: '500px' }}
              ></div>
              <p className="text-xs text-gray-500 mt-2">
                ✏️ Use the drawing tools to create your route boundary
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-6">
        {/* Create Button */}
        <button
          onClick={() => {
            setShowMapMode(true);
            setFormData({
              routeName: '',
              routeCode: '',
              pincode: '',
              estimatedDuration: '60',
              frequency: 'daily',
            });
            setError('');
          }}
          className="inline-flex items-center space-x-2 btn-primary"
        >
          <MapPin className="w-5 h-5" />
          <span>Create Route with Map</span>
        </button>

        {/* Search */}
        <div className="card">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search routes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Routes Grid */}
        <div className="space-y-4">
          {filteredRoutes.length === 0 ? (
            <div className="card text-center py-12">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No routes yet. Create one to get started!</p>
            </div>
          ) : (
            filteredRoutes.map((route) => (
              <div key={route.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-bold text-gray-900">{route.routeName}</h4>
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 text-xs rounded font-semibold">
                        {route.routeCode}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{route.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-gray-500 text-xs font-semibold">PINCODE</p>
                        <p className="text-gray-900 text-sm">{route.pinCodes.join(', ')}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-semibold">DURATION</p>
                        <p className="text-gray-900 text-sm">{route.estimatedDuration} mins</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-semibold">FREQUENCY</p>
                        <span className="inline-block bg-green-100 text-green-700 px-2 py-1 text-xs rounded capitalize">
                          {route.frequency}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-semibold">COORDINATES</p>
                        <p className="text-gray-900 text-sm">{route.coordinates.length} pts</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(route.id)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700 p-2 rounded hover:bg-red-50 disabled:opacity-50"
                  >
                    {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="card flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span> | Total: <span className="font-bold">{totalItems}</span> routes
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
  );
}
