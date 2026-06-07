import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getProfileAPI, updateProfileAPI, addAddressAPI, deleteAddressAPI } from '../api/userAPI';
import { updateUser } from '../redux/slices/authSlice';
import Breadcrumb from '../components/common/Breadcrumb';
import Loader from '../components/common/Loader';

export default function Profile() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Address modal/form states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressData, setAddressData] = useState({
    label: 'Home',
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await getProfileAPI();
      setName(res.user.name || '');
      setPhone(res.user.phone || '');
      return res;
    },
  });

  const user = data?.user;

  const updateProfileMutation = useMutation({
    mutationFn: updateProfileAPI,
    onSuccess: (res) => {
      toast.success('Profile updated successfully! ✅');
      dispatch(updateUser(res.user));
      queryClient.invalidateQueries(['profile']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: addAddressAPI,
    onSuccess: () => {
      toast.success('Address added successfully! 📍');
      setShowAddressForm(false);
      setAddressData({
        label: 'Home',
        name: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'US',
      });
      queryClient.invalidateQueries(['profile']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add address');
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: deleteAddressAPI,
    onSuccess: () => {
      toast.success('Address deleted');
      queryClient.invalidateQueries(['profile']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete address');
    },
  });

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate({ name, phone });
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    addAddressMutation.mutate(addressData);
  };

  if (isLoading) return <Loader variant="fullpage" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'My Profile', path: '/profile' }]} />

      <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-6">My Profile 👤</h1>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Profile Card & Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 text-center space-y-4">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-glow">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user?.name}</h2>
              <p className="text-xs text-slate-400 capitalize">{user?.role} Account</p>
            </div>
          </div>

          {/* Update Details */}
          <div className="card p-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-4">Edit Profile</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field pl-9 py-2 text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field pl-9 py-2 text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="btn-primary w-full py-2.5 text-xs justify-center"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Address Book Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-4 mb-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base flex items-center gap-1.5">
                <FiMapPin size={18} className="text-primary-600" /> Shipping Addresses
              </h3>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="btn-primary py-1.5 px-3 text-xs"
              >
                <FiPlus size={14} /> Add Address
              </button>
            </div>

            {/* Address List */}
            <div className="space-y-3">
              {user?.addresses?.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No saved addresses found. Add one above!</p>
              ) : (
                user?.addresses?.map((addr) => (
                  <div
                    key={addr._id}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-start justify-between gap-4"
                  >
                    <div className="text-sm space-y-0.5">
                      <span className="badge-primary text-[10px] font-bold uppercase">{addr.label}</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">{addr.name}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">
                        {addr.street}, {addr.city}, {addr.state} {addr.zip}, {addr.country}
                      </p>
                      <p className="text-slate-400 text-xs mt-1">☎️ {addr.phone}</p>
                    </div>
                    <button
                      onClick={() => deleteAddressMutation.mutate(addr._id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shrink-0"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Address Form Modal/Drawer */}
          {showAddressForm && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-4">Add New Address</h3>
              <form onSubmit={handleAddAddress} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Label (e.g. Home, Office)
                    </label>
                    <input
                      type="text"
                      value={addressData.label}
                      onChange={(e) => setAddressData({ ...addressData, label: e.target.value })}
                      className="input-field py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      value={addressData.name}
                      onChange={(e) => setAddressData({ ...addressData, name: e.target.value })}
                      className="input-field py-2 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={addressData.phone}
                      onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
                      className="input-field py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={addressData.street}
                      onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                      className="input-field py-2 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={addressData.city}
                      onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                      className="input-field py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={addressData.state}
                      onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                      className="input-field py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      ZIP
                    </label>
                    <input
                      type="text"
                      value={addressData.zip}
                      onChange={(e) => setAddressData({ ...addressData, zip: e.target.value })}
                      className="input-field py-2 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="btn-outline py-2 px-4 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addAddressMutation.isPending}
                    className="btn-primary py-2 px-4 text-xs font-bold"
                  >
                    {addAddressMutation.isPending ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
