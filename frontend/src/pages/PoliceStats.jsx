import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, getDocs, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, ComposedChart } from 'recharts';

const COLORS = {
  pending: '#f59e0b',
  inProcess: '#3b82f6',
  fundsFrozen: '#8b5cf6',
  refunded: '#10b981',
  closed: '#6b7280'
};

// Odisha Districts/Zones mapping
const ODISHA_DISTRICTS = {
  'Bhubaneswar': { lat: 20.2961, lng: 85.8245, zone: 'Central' },
  'Cuttack': { lat: 20.4625, lng: 85.8829, zone: 'Central' },
  'Puri': { lat: 19.8135, lng: 85.8315, zone: 'Central' },
  'Khordha': { lat: 20.1824, lng: 85.6169, zone: 'Central' },
  'Jagatsinghpur': { lat: 20.2657, lng: 86.1685, zone: 'Central' },
  'Kendrapada': { lat: 20.5014, lng: 86.4186, zone: 'Central' },
  'Balasore': { lat: 21.4944, lng: 86.9336, zone: 'Northern' },
  'Bhadrak': { lat: 21.0550, lng: 86.5000, zone: 'Northern' },
  'Mayurbhanj': { lat: 21.9333, lng: 86.7333, zone: 'Northern' },
  'Keonjhar': { lat: 21.6333, lng: 85.5833, zone: 'Northern' },
  'Sundargarh': { lat: 22.1167, lng: 84.0333, zone: 'Northern' },
  'Sambalpur': { lat: 21.4667, lng: 83.9667, zone: 'Western' },
  'Bargarh': { lat: 21.3333, lng: 83.6167, zone: 'Western' },
  'Jharsuguda': { lat: 21.8500, lng: 84.0333, zone: 'Western' },
  'Deogarh': { lat: 21.5333, lng: 84.7333, zone: 'Western' },
  'Angul': { lat: 20.8333, lng: 85.1000, zone: 'Central' },
  'Dhenkanal': { lat: 20.6667, lng: 85.6000, zone: 'Central' },
  'Nayagarh': { lat: 20.1333, lng: 85.1000, zone: 'Central' },
  'Ganjam': { lat: 19.3167, lng: 85.0500, zone: 'Southern' },
  'Gajapati': { lat: 18.9167, lng: 84.2000, zone: 'Southern' },
  'Kandhamal': { lat: 20.4667, lng: 84.2333, zone: 'Southern' },
  'Boudh': { lat: 20.8333, lng: 84.3167, zone: 'Southern' },
  'Kalahandi': { lat: 19.9167, lng: 83.1667, zone: 'Southern' },
  'Nuapada': { lat: 20.6167, lng: 82.6167, zone: 'Southern' },
  'Koraput': { lat: 18.8167, lng: 82.7167, zone: 'Southern' },
  'Malkangiri': { lat: 18.3500, lng: 81.9000, zone: 'Southern' },
  'Nabarangpur': { lat: 19.2333, lng: 82.5500, zone: 'Southern' },
  'Rayagada': { lat: 19.1667, lng: 83.4167, zone: 'Southern' },
  'Jajpur': { lat: 20.8500, lng: 86.3333, zone: 'Central' },
  'Kendrapara': { lat: 20.5000, lng: 86.4167, zone: 'Central' }
};

// Function to find nearest district
function findNearestDistrict(lat, lng) {
  let minDist = Infinity;
  let nearest = 'Unknown';
  
  Object.entries(ODISHA_DISTRICTS).forEach(([name, data]) => {
    const dist = Math.sqrt(
      Math.pow(lat - data.lat, 2) + Math.pow(lng - data.lng, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      nearest = name;
    }
  });
  
  return nearest;
}

// Heatmap Component
function OdishaHeatmap({ cases }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (containerRef.current) {
      const updateDimensions = () => {
        if (containerRef.current) {
          setDimensions({
            width: containerRef.current.offsetWidth,
            height: containerRef.current.offsetHeight
          });
        }
      };
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const width = dimensions.width;
      const height = dimensions.height;

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Odisha bounds (accurate)
      // Odisha extends from approximately 17.49°N to 22.57°N and 81.24°E to 87.52°E
      const minLat = 17.49;
      const maxLat = 22.57;
      const minLng = 81.24;
      const maxLng = 87.52;

      // Filter cases with valid coordinates
      const validCases = cases.filter(c => 
        c.locationLatitude && c.locationLongitude &&
        typeof c.locationLatitude === 'number' && typeof c.locationLongitude === 'number' &&
        !isNaN(c.locationLatitude) && !isNaN(c.locationLongitude) &&
        c.locationLatitude >= minLat && c.locationLatitude <= maxLat &&
        c.locationLongitude >= minLng && c.locationLongitude <= maxLng
      );

      if (validCases.length === 0) {
        ctx.fillStyle = '#6b7280';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No location data available', width / 2, height / 2);
        ctx.font = '14px Arial';
        ctx.fillText('Cases will appear here when location data is available', width / 2, height / 2 + 25);
        return;
      }

      // Limit points for performance (sample if too many)
      const maxPoints = 500;
      const pointsToRender = validCases.length > maxPoints 
        ? validCases.slice(0, maxPoints) 
        : validCases;

      // Create heatmap data points with correct coordinate transformation
      // X = longitude (east-west), Y = latitude (north-south, inverted for screen coordinates)
      const latRange = maxLat - minLat;
      const lngRange = maxLng - minLng;
      
      const points = pointsToRender.map((c, index) => {
        // Normalize longitude (0 to 1) - maps directly to X (left to right)
        const normalizedLng = (c.locationLongitude - minLng) / lngRange;
        // Normalize latitude (0 to 1, then invert for screen Y)
        // Higher latitude (north) should be at top (lower Y value)
        const normalizedLat = 1 - ((c.locationLatitude - minLat) / latRange);
        
        // Calculate pixel coordinates
        const x = normalizedLng * width;
        const y = normalizedLat * height;
        
        // Debug: Log first few points to verify transformation
        if (index < 3) {
          console.log(`Case ${index + 1} location:`, {
            lat: c.locationLatitude,
            lng: c.locationLongitude,
            normalizedLng: normalizedLng.toFixed(3),
            normalizedLat: normalizedLat.toFixed(3),
            canvasX: x.toFixed(1),
            canvasY: y.toFixed(1),
            canvasWidth: width,
            canvasHeight: height,
            bounds: { minLat, maxLat, minLng, maxLng }
          });
        }
        
        return {
          x,
          y,
          lat: c.locationLatitude,
          lng: c.locationLongitude,
          intensity: 1
        };
      });

      // Draw heatmap using radial gradients (optimized approach)
      // Radius should be proportional to map scale
      const radius = Math.min(width, height) * 0.06;
      
      // Use a simpler approach: draw gradients directly instead of pixel-by-pixel
      // This is much more performant and avoids stack overflow
      // Draw in reverse order so overlapping areas show higher intensity
      const sortedPoints = [...points].reverse();
      
      sortedPoints.forEach(point => {
        try {
          // Validate point coordinates are within canvas bounds
          if (point.x < 0 || point.x > width || point.y < 0 || point.y > height) {
            return;
          }
          
          const gradient = ctx.createRadialGradient(
            point.x, point.y, 0,
            point.x, point.y, radius
          );
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.7)');
          gradient.addColorStop(0.3, 'rgba(245, 158, 11, 0.5)');
          gradient.addColorStop(0.6, 'rgba(251, 191, 36, 0.3)');
          gradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
          ctx.fill();
        } catch (err) {
          console.warn('Error drawing heatmap point:', err, point);
        }
      });

      // Draw case markers on top (limit to visible ones for performance)
      const markersToShow = points.length > 200 ? points.slice(0, 200) : points;
      markersToShow.forEach((point) => {
        try {
          // Validate point coordinates
          if (point.x < 0 || point.x > width || point.y < 0 || point.y > height) {
            return;
          }
          
          // Draw marker with shadow effect
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          
          // Inner dot
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
          ctx.fill();
        } catch (err) {
          console.warn('Error drawing marker:', err, point);
        }
      });
    } catch (error) {
      console.error('Error rendering heatmap:', error);
    }
  }, [cases, dimensions]);

  const casesWithLocation = cases.filter(c => c.locationLatitude && c.locationLongitude).length;

  return (
    <div ref={containerRef} className="relative w-full h-full bg-gradient-to-br from-blue-50 to-amber-50 rounded-xl overflow-hidden border-2 border-gray-200">
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-lg shadow-lg border-2 border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
          <span className="text-sm font-bold text-gray-800">
            {casesWithLocation} Cases with Location
          </span>
        </div>
      </div>
      
      {/* Base Map - Odisha bounds: 81.24°E to 87.52°E, 17.49°N to 22.57°N */}
      {/* Using Leaflet-style bounds format: minLng,minLat,maxLng,maxLat */}
      <iframe
        src={`https://www.openstreetmap.org/export/embed.html?bbox=81.24,17.49,87.52,22.57&layer=mapnik`}
        className="absolute inset-0 w-full h-full"
        style={{ border: 0 }}
        title="Odisha Map"
      ></iframe>
      
      {/* Heatmap Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        style={{ mixBlendMode: 'multiply' }}
      ></canvas>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-20 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border-2 border-gray-200">
        <p className="text-xs font-bold text-gray-800 mb-2.5">Heat Intensity</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-red-600 rounded-full"></div>
            <span className="text-xs text-gray-700 font-semibold">High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
            <span className="text-xs text-gray-700 font-semibold">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-amber-200 rounded-full"></div>
            <span className="text-xs text-gray-700 font-semibold">Low</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StatisticsPage({ role = 'police' }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    byStatus: {},
    byFraudType: {},
    byMonth: {},
    byZone: {},
    byDistrict: {},
    byHour: {},
    totalAmount: 0,
    averageAmount: 0,
    resolvedRate: 0,
    averageResolutionTime: 0,
    firFiled: 0,
    pendingInvestigation: 0,
    fundsFrozen: 0,
    refunded: 0
  });

  useEffect(() => {
    fetchCases();
    
    // Set up real-time listener
    const casesRef = collection(db, 'cases');
    const unsubscribe = onSnapshot(casesRef, (snapshot) => {
      const casesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCases(casesData);
      calculateStats(casesData);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to cases:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function fetchCases() {
    try {
      setLoading(true);
      const casesRef = collection(db, 'cases');
      const q = query(casesRef);
      const snapshot = await getDocs(q);
      const casesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCases(casesData);
      calculateStats(casesData);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(casesData) {
    const statusCount = {};
    const fraudTypeCount = {};
    const monthCount = {};
    const zoneCount = {};
    const districtCount = {};
    const hourCount = {};
    let totalAmount = 0;
    let resolvedCount = 0;
    let totalResolutionTime = 0;
    let firFiled = 0;
    let fundsFrozen = 0;
    let refunded = 0;

    casesData.forEach(c => {
      // Status count
      const status = c.status || 'Pending';
      statusCount[status] = (statusCount[status] || 0) + 1;

      // Fraud type count
      const fraudType = c.fraudType || 'Unknown';
      fraudTypeCount[fraudType] = (fraudTypeCount[fraudType] || 0) + 1;

      // Month count
      const date = new Date(c.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthCount[monthKey] = (monthCount[monthKey] || 0) + 1;

      // Hour count (for time-based analysis)
      const hour = date.getHours();
      hourCount[hour] = (hourCount[hour] || 0) + 1;

      // Zone and District count
      if (c.locationLatitude && c.locationLongitude) {
        const district = findNearestDistrict(c.locationLatitude, c.locationLongitude);
        districtCount[district] = (districtCount[district] || 0) + 1;
        
        const zone = ODISHA_DISTRICTS[district]?.zone || 'Unknown';
        zoneCount[zone] = (zoneCount[zone] || 0) + 1;
      }

      // Amount
      if (c.transactions && c.transactions[0] && c.transactions[0].amount) {
        totalAmount += c.transactions[0].amount;
      }

      // FIR filed
      if (c.firFiledAt) {
        firFiled++;
      }

      // Funds frozen
      if (status === 'Funds Frozen') {
        fundsFrozen++;
      }

      // Refunded
      if (status === 'Refunded') {
        refunded++;
      }

      // Resolution time
      if (c.status === 'Closed' || c.status === 'Refunded') {
        resolvedCount++;
        if (c.updatedAt && c.createdAt) {
          const resolutionTime = (c.updatedAt - c.createdAt) / (1000 * 60 * 60 * 24); // days
          totalResolutionTime += resolutionTime;
        }
      }
    });

    const resolvedRate = casesData.length > 0 ? (resolvedCount / casesData.length) * 100 : 0;
    const avgResolutionTime = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0;

    setStats({
      total: casesData.length,
      byStatus: statusCount,
      byFraudType: fraudTypeCount,
      byMonth: monthCount,
      byZone: zoneCount,
      byDistrict: districtCount,
      byHour: hourCount,
      totalAmount,
      averageAmount: casesData.length > 0 ? totalAmount / casesData.length : 0,
      resolvedRate,
      averageResolutionTime: avgResolutionTime,
      firFiled,
      pendingInvestigation: statusCount['Pending'] || 0,
      fundsFrozen,
      refunded
    });
  }

  const statusData = Object.entries(stats.byStatus).map(([name, value]) => ({
    name: name,
    value: value,
    color: COLORS[name.toLowerCase().replace(/\s+/g, '')] || COLORS.pending
  }));

  const fraudTypeData = Object.entries(stats.byFraudType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      value: value
    }));

  const monthlyData = Object.entries(stats.byMonth)
    .sort()
    .slice(-12)
    .map(([month, count]) => ({
      month: month.split('-')[1] + '/' + month.split('-')[0].slice(2),
      cases: count
    }));

  const zoneData = Object.entries(stats.byZone)
    .sort((a, b) => b[1] - a[1])
    .map(([zone, count]) => ({
      zone,
      cases: count
    }));

  const districtData = Object.entries(stats.byDistrict)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([district, count]) => ({
      district: district.length > 12 ? district.substring(0, 12) + '...' : district,
      cases: count
    }));

  const hourData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    cases: stats.byHour[i] || 0
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/30 to-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold text-lg">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/30 to-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  Police Statistics Dashboard
                </h1>
                <p className="text-gray-600 text-sm mt-2 ml-16">Real-time Analytics & Insights for Odisha</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-green-100 border-2 border-green-300 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-green-700">Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1">Total Cases</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">All registered complaints</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1">Total Amount</p>
              <p className="text-3xl font-bold text-gray-900">₹{stats.totalAmount.toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-500 mt-1">Financial impact</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1">Resolved Rate</p>
              <p className="text-3xl font-bold text-gray-900">{stats.resolvedRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">Cases closed/refunded</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1">FIR Filed</p>
              <p className="text-3xl font-bold text-gray-900">{stats.firFiled}</p>
              <p className="text-xs text-gray-500 mt-1">Official complaints</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-600 text-xs font-semibold">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingInvestigation}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-violet-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-gray-600 text-xs font-semibold">Funds Frozen</p>
              <p className="text-2xl font-bold text-gray-900">{stats.fundsFrozen}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-600 text-xs font-semibold">Refunded</p>
              <p className="text-2xl font-bold text-gray-900">{stats.refunded}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-600 text-xs font-semibold">Avg Resolution</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageResolutionTime.toFixed(1)}d</p>
            </div>
          </div>
        </div>
      </div>

      {/* Odisha Heatmap */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Odisha Case Distribution Heatmap</h2>
            <p className="text-sm text-gray-600">Real-time visualization of complaint locations across districts</p>
          </div>
        </div>
        <div className="h-[600px] rounded-xl overflow-hidden border-2 border-gray-200">
          <OdishaHeatmap cases={cases} />
        </div>
      </div>

      {/* Zone-wise Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Cases by Zone</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={zoneData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="zone" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '2px solid #f59e0b', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }} 
              />
              <Bar dataKey="cases" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Top 10 Districts</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={districtData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" tick={{ fill: '#6b7280' }} />
              <YAxis dataKey="district" type="category" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 11 }} width={100} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '2px solid #f59e0b', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }} 
              />
              <Bar dataKey="cases" fill="#3b82f6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Cases by Status</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '2px solid #f59e0b', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Fraud Type Bar Chart */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Top Fraud Types</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fraudTypeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '2px solid #f59e0b', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }} 
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Time-based Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Trend */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Cases Trend (Last 12 Months)</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" tick={{ fill: '#6b7280' }} />
              <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '2px solid #f59e0b', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }} 
              />
              <Area type="monotone" dataKey="cases" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCases)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly Distribution */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Cases by Hour of Day</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={hourData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hour" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 10 }} />
              <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '2px solid #f59e0b', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }} 
              />
              <Bar dataKey="cases" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="cases" stroke="#f59e0b" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Zone-wise Detailed Stats */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Zone-wise Case Distribution</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {zoneData.map((zone, idx) => {
            const percentage = stats.total > 0 ? ((zone.cases / stats.total) * 100).toFixed(1) : 0;
            return (
              <div key={idx} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-bold text-gray-900">{zone.zone}</h4>
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm">{zone.cases}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 font-semibold">{percentage}% of total cases</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
