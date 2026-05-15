import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAdmins, registerAdmin, clearErrors, clearSuccess } from '../../redux/actions/adminActions';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Mail, 
  Phone, 
  Shield, 
  User, 
  X,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const AdminManagement = () => {
  const dispatch = useDispatch();
  const { admins, loading, error, success, message } = useSelector((state) => state.admin);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'ADMIN'
  });

  useEffect(() => {
    dispatch(getAdmins());
  }, [dispatch]);

  // Handle success/error clearing
  useEffect(() => {
    if (success) {
      setFormData({ fullName: '', email: '', password: '', phone: '', role: 'ADMIN' });
      const timer = setTimeout(() => {
        setShowModal(false);
        dispatch(clearSuccess());
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearErrors());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(registerAdmin(formData));
  };

  return (
    <div className="animate-fade-in p-2">
      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <button 
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#111827',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={18} strokeWidth={3} />
          Register New Admin
        </button>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Admins', value: admins.length, color: '#6366F1' },
          { label: 'Active Sessions', value: Math.floor(admins.length * 0.7), color: '#10B981' },
          { label: 'System Access', value: '100%', color: '#F59E0B' },
          { label: 'Pending Invitations', value: '0', color: '#EF4444' }
        ].map((stat, i) => (
          <div key={i} style={{ 
            background: '#fff', 
            padding: '16px 20px', 
            borderRadius: '16px', 
            border: '1px solid #F3F4F6',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginTop: '4px' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #F3F4F6', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              placeholder="Search by name, email..." 
              style={{
                padding: '10px 12px 10px 40px',
                borderRadius: '10px',
                border: '1px solid #E5E7EB',
                width: '300px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
          <button style={{ background: 'transparent', border: 'none', color: '#6B7280', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Filter & Sort</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#F9FAFB' }}>
              <tr>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase' }}>Administrator</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase' }}>Contact Info</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase' }}>Role</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center' }}>
                    <Loader2 className="animate-spin" color="#6366F1" size={24} style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '12px', color: '#6B7280', fontSize: '14px' }}>Fetching administrator list...</p>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>No administrators found.</td>
                </tr>
              ) : admins.map((admin) => (
                <tr key={admin.id} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '12px', 
                        background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: '14px'
                      }}>
                        {admin.fullName?.charAt(0) || <User size={18} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#111827', fontSize: '14px' }}>{admin.fullName}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>ID: {admin.id?.toString().slice(-8) || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4B5563' }}>
                        <Mail size={14} color="#9CA3AF" /> {admin.email}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4B5563' }}>
                        <Phone size={14} color="#9CA3AF" /> {admin.phone}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '6px', 
                      background: '#EEF2FF', color: '#4F46E5', 
                      padding: '4px 10px', borderRadius: '8px', 
                      fontSize: '12px', fontWeight: 700 
                    }}>
                      <Shield size={12} /> {admin.role}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#059669' }}>Active</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(17, 24, 39, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div 
            className="animate-slide-up"
            style={{
              background: '#fff',
              width: '100%',
              maxWidth: '500px',
              borderRadius: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div style={{ 
              padding: '24px', 
              borderBottom: '1px solid #F3F4F6', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: 'linear-gradient(to right, #F9FAFB, #fff)'
            }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: 0 }}>Register Administrator</h3>
                <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>Create a new administrator account with system access.</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: '#F3F4F6', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer' }}
              >
                <X size={18} color="#6B7280" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Status Messages */}
                {error && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', color: '#B91C1C', fontSize: '14px', fontWeight: 600 }}>
                    <AlertCircle size={18} /> {error}
                  </div>
                )}
                {success && (
                  <div style={{ background: '#ECFDF5', border: '1px solid #D1FAE5', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', color: '#047857', fontSize: '14px', fontWeight: 600 }}>
                    <CheckCircle2 size={18} /> {success}
                  </div>
                )}

                {/* Input Fields */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Full Name</label>
                  <input 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. John Doe"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Email Address</label>
                    <input 
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="admin@example.com"
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Phone Number</label>
                    <input 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="9876543210"
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Security Password</label>
                  <input 
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="••••••••"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                  />
                  <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '6px' }}>Password must be at least 8 characters with special symbols.</p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>System Role</label>
                  <select 
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none', background: '#fff' }}
                  >
                    <option value="ADMIN">Administrator</option>
                    <option value="HR">HR Manager</option>
                    <option value="FINANCE">Finance Head</option>
                  </select>
                </div>

                {/* Footer Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    style={{ 
                      flex: 1.5, 
                      padding: '14px', 
                      borderRadius: '14px', 
                      border: 'none', 
                      background: '#111827', 
                      color: '#fff', 
                      fontWeight: 700, 
                      fontSize: '14px', 
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create Account'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AdminManagement;
