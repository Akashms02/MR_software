import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Package, 
  Plus, 
  Upload, 
  Download, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  CheckCircle, 
  FileSpreadsheet, 
  AlertCircle,
  Percent,
  Tag,
  HelpCircle,
  Lock
} from 'lucide-react';
import axios from '../../api/axiosInstance';
import { API_ROUTE } from '../../data/env';

export default function AdminProductsPage() {
  const { user } = useSelector((state) => state.auth || {});
  const userRole = (user?.role || '').toLowerCase().replace(/_/g, ' ').trim();

  // ONLY Admin and ZBM (Zone Manager) can upload Excel or create/edit products
  const canUploadOrEdit = ['super admin', 'superadmin', 'admin', 'zone manager', 'zonal manager', 'zonal business manager', 'zbm'].includes(userRole);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    composition: '',
    packSize: '',
    category: 'Tablets',
    mrp: '',
    ptr: '',
    retailerMargin: '',
    pts: '',
    distributorMargin: '',
    tts: '',
    offer: '',
    gstPercentage: '18.00',
    description: ''
  });

  // Excel Upload State
  const [excelFile, setExcelFile] = useState(null);
  const [uploadingExcel, setUploadingExcel] = useState(false);

  // Fetch Products from DB API via POST Filter Endpoint
  const fetchProducts = async (cat = selectedCategory, search = searchTerm) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_ROUTE}/products/filter`, {
        category: cat,
        search: search
      });
      if (res.data && res.data.data) {
        setProducts(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch products from DB whenever Category or Search Term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(selectedCategory, searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchTerm]);

  // Auto-calculate margins when prices change
  const handlePriceChange = (field, value) => {
    const updated = { ...formData, [field]: value };

    const mrp = parseFloat(updated.mrp) || 0;
    const ptr = parseFloat(updated.ptr) || 0;
    const pts = parseFloat(updated.pts) || 0;

    // Calculate Retailer Margin % = ((MRP - PTR) / MRP) * 100
    if (field === 'mrp' || field === 'ptr') {
      if (mrp > 0 && ptr > 0) {
        const rMargin = (((mrp - ptr) / mrp) * 100).toFixed(2);
        updated.retailerMargin = rMargin;
      }
    }

    // Calculate Distributor Margin % = ((PTR - PTS) / PTR) * 100
    if (field === 'ptr' || field === 'pts') {
      if (ptr > 0 && pts > 0) {
        const dMargin = (((ptr - pts) / ptr) * 100).toFixed(2);
        updated.distributorMargin = dMargin;
      }
    }

    setFormData(updated);
  };

  const handleOpenForm = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        code: product.code || '',
        composition: product.composition || '',
        packSize: product.packSize || '',
        category: product.category || 'Tablets',
        mrp: product.mrp || '',
        ptr: product.ptr || '',
        retailerMargin: product.retailerMargin || '',
        pts: product.pts || '',
        distributorMargin: product.distributorMargin || '',
        tts: product.tts || '',
        offer: product.offer || '',
        gstPercentage: product.gstPercentage !== undefined && product.gstPercentage !== null ? product.gstPercentage : '',
        description: product.description || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        code: '',
        composition: '',
        packSize: '',
        category: 'Tablets',
        mrp: '',
        ptr: '',
        retailerMargin: '',
        pts: '',
        distributorMargin: '',
        tts: '',
        offer: '',
        gstPercentage: '18.00',
        description: ''
      });
    }
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const payload = {
      ...formData,
      mrp: parseFloat(formData.mrp) || 0,
      ptr: parseFloat(formData.ptr) || 0,
      pts: parseFloat(formData.pts) || 0,
      retailerMargin: formData.retailerMargin ? parseFloat(formData.retailerMargin) : null,
      distributorMargin: formData.distributorMargin ? parseFloat(formData.distributorMargin) : null,
      tts: formData.tts ? parseFloat(formData.tts) : null,
      gstPercentage: formData.gstPercentage ? parseFloat(formData.gstPercentage) : null
    };

    try {
      if (editingProduct) {
        await axios.put(`${API_ROUTE}/products/${editingProduct.id}`, payload);
        setSuccessMsg(`Product "${formData.name}" updated successfully!`);
      } else {
        await axios.post(`${API_ROUTE}/products`, payload);
        setSuccessMsg(`Product "${formData.name}" created successfully!`);
      }
      setIsFormOpen(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return;
    try {
      await axios.delete(`${API_ROUTE}/products/${id}`);
      setSuccessMsg(`Product "${name}" deleted.`);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete product');
    }
  };

  // Download Sample Excel
  const handleDownloadSample = async () => {
    try {
      const response = await axios.get(`${API_ROUTE}/products/sample-excel`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sample_products_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download sample template');
    }
  };

  // Upload Excel File
  const handleExcelUpload = async (e) => {
    e.preventDefault();
    if (!excelFile) {
      setError('Please select an Excel file to upload');
      return;
    }

    const fileData = new FormData();
    fileData.append('file', excelFile);

    setUploadingExcel(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await axios.post(`${API_ROUTE}/products/upload-excel`, fileData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const count = res.data?.data?.length || 0;
      setSuccessMsg(`Successfully imported ${count} products from Excel!`);
      setIsExcelModalOpen(false);
      setExcelFile(null);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to upload Excel file');
    } finally {
      setUploadingExcel(false);
    }
  };

  const categories = ['ALL', 'Tablets', 'Syrups', 'Injections', 'Ointments', 'Drops', 'Capsules', 'Other'];

  return (
    <div className="p-6 max-w-[1400px] mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="text-blue-600" size={26} />
            Products & Pricing Catalog
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage product MRP, PTR, PTS, Distributor & Retailer Margins, Schemes, and GST.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canUploadOrEdit ? (
            <>
              <button
                onClick={() => setIsExcelModalOpen(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
              >
                <FileSpreadsheet size={18} />
                <span>Bulk Excel Upload</span>
              </button>

              <button
                onClick={() => handleOpenForm()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
              >
                <Plus size={18} />
                <span>Add Product</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl">
              <Lock size={15} className="text-slate-500" />
              <span>Read-Only View</span>
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0 text-red-600" />
          <span className="text-sm font-medium">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <X size={18} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-3">
          <CheckCircle size={20} className="shrink-0 text-emerald-600" />
          <span className="text-sm font-medium">{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="ml-auto text-emerald-500 hover:text-emerald-700">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by Product Name, Code (SKU), or Composition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Product & Composition</th>
                <th className="py-3.5 px-4">Category / Pack</th>
                <th className="py-3.5 px-4 text-right">MRP (₹)</th>
                <th className="py-3.5 px-4 text-right">PTR (₹)</th>
                <th className="py-3.5 px-4 text-right">Ret. Margin %</th>
                <th className="py-3.5 px-4 text-right">PTS (₹)</th>
                <th className="py-3.5 px-4 text-right">Dist. Margin %</th>
                <th className="py-3.5 px-4 text-right">TTS (₹)</th>
                <th className="py-3.5 px-4">Offer / Scheme</th>
                <th className="py-3.5 px-4 text-center">GST %</th>
                {canUploadOrEdit && <th className="py-3.5 px-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={canUploadOrEdit ? "12" : "11"} className="py-12 text-center text-gray-400">
                    Loading product catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={canUploadOrEdit ? "12" : "11"} className="py-12 text-center text-gray-400">
                    {canUploadOrEdit ? (
                      <>No products found. Click <strong>"Add Product"</strong> or <strong>"Bulk Excel Upload"</strong> to populate products.</>
                    ) : (
                      <>No products found in the catalog.</>
                    )}
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-semibold text-gray-900 text-xs">
                      {p.code || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{p.name}</div>
                      {p.composition && (
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{p.composition}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium mr-1.5">
                        {p.category || 'General'}
                      </span>
                      {p.packSize && <span className="text-gray-500">{p.packSize}</span>}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      ₹{p.mrp ? Number(p.mrp).toFixed(2) : '0.00'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-blue-700">
                      ₹{p.ptr ? Number(p.ptr).toFixed(2) : '0.00'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-emerald-600">
                      {p.retailerMargin ? `${Number(p.retailerMargin).toFixed(2)}%` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-indigo-700">
                      ₹{p.pts ? Number(p.pts).toFixed(2) : '0.00'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-purple-600">
                      {p.distributorMargin ? `${Number(p.distributorMargin).toFixed(2)}%` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-gray-600">
                      {p.tts ? `₹${Number(p.tts).toFixed(2)}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {p.offer ? (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-medium">
                          {p.offer}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-xs">
                      {p.gstPercentage !== null && p.gstPercentage !== undefined ? `${p.gstPercentage}%` : '0%'}
                    </td>
                    {canUploadOrEdit && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenForm(p)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden my-8">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CardioMax 50mg"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Product Code / SKU
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PROD-101"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Composition / Salt
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Amlodipine 5mg + Telmisartan 40mg"
                    value={formData.composition}
                    onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="Tablets">Tablets</option>
                    <option value="Syrups">Syrups</option>
                    <option value="Injections">Injections</option>
                    <option value="Ointments">Ointments</option>
                    <option value="Drops">Drops</option>
                    <option value="Capsules">Capsules</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Pack Size
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10x10 Tablets, 100ml Bottle"
                    value={formData.packSize}
                    onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    GST Tax % (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 18.00 or leave 0"
                    value={formData.gstPercentage}
                    onChange={(e) => setFormData({ ...formData, gstPercentage: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <hr className="my-2 border-gray-200" />
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pricing & Margins</h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    MRP (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="150.00"
                    value={formData.mrp}
                    onChange={(e) => handlePriceChange('mrp', e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    PTR - Price To Retailer (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="110.00"
                    value={formData.ptr}
                    onChange={(e) => handlePriceChange('ptr', e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Retailer Margin %
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Auto-calculated"
                    value={formData.retailerMargin}
                    onChange={(e) => setFormData({ ...formData, retailerMargin: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-emerald-50 text-emerald-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    PTS - Price To Stockist (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="95.00"
                    value={formData.pts}
                    onChange={(e) => handlePriceChange('pts', e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-indigo-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Distributor Margin %
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Auto-calculated"
                    value={formData.distributorMargin}
                    onChange={(e) => setFormData({ ...formData, distributorMargin: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-purple-50 text-purple-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    TTS - Trade To Stockist (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="90.00"
                    value={formData.tts}
                    onChange={(e) => setFormData({ ...formData, tts: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Offer / Scheme Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10 + 1 Free or 5% Trade Discount"
                  value={formData.offer}
                  onChange={(e) => setFormData({ ...formData, offer: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition"
                >
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Excel Upload Modal */}
      {isExcelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <FileSpreadsheet className="text-emerald-400" size={22} />
                Bulk Product Excel Import
              </h3>
              <button onClick={() => setIsExcelModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleExcelUpload} className="p-6 space-y-5">
              {/* Step 1: Download Sample */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-900 uppercase">Step 1: Get Template</div>
                  <div className="text-xs text-emerald-700 mt-0.5">Download pre-formatted Excel template with sample rows.</div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition"
                >
                  <Download size={14} />
                  <span>Download Sample</span>
                </button>
              </div>

              {/* Step 2: Upload File */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Step 2: Upload Completed Excel (.xlsx)
                </label>
                <div className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-2xl p-6 text-center transition bg-slate-50/50">
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={(e) => setExcelFile(e.target.files[0])}
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {excelFile && (
                    <div className="mt-3 text-xs font-semibold text-emerald-600 flex items-center justify-center gap-1">
                      <CheckCircle size={14} /> Selected: {excelFile.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsExcelModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingExcel || !excelFile}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2"
                >
                  {uploadingExcel ? 'Importing...' : 'Upload & Import Products'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
