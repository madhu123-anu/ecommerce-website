import { useEffect, forwardRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiUser, FiPhone, FiMapPin, FiGlobe } from 'react-icons/fi';

const schema = yup.object({
  fullName: yup.string().required('Full name is required').min(2, 'Name too short'),
  phone: yup.string().required('Phone is required').matches(/^[+\d\s-]{10,}$/, 'Invalid phone number'),
  street: yup.string().required('Street address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  country: yup.string().required('Country is required'),
  zip: yup.string().required('ZIP code is required'),
});

const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Australia',
  'Germany', 'France', 'Japan', 'India', 'Singapore', 'UAE',
];

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming',
];

const InputField = forwardRef(({ label, error, icon: Icon, ...props }, ref) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        )}
        <input
          ref={ref}
          {...props}
          className={`input-field ${Icon ? 'pl-9' : ''} ${error ? 'input-error' : ''}`}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
});

InputField.displayName = 'InputField';

export default function AddressForm({ onSubmit, savedAddresses = [], defaultValues }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaultValues || {},
  });

  const handleSavedAddressSelect = (address) => {
    setValue('fullName', address.fullName);
    setValue('phone', address.phone);
    setValue('street', address.street);
    setValue('city', address.city);
    setValue('state', address.state);
    setValue('country', address.country);
    setValue('zip', address.zip);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Saved Addresses */}
      {savedAddresses.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Saved Addresses
          </h4>
          <div className="space-y-2">
            {savedAddresses.map((addr, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSavedAddressSelect(addr)}
                className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all text-sm"
              >
                <p className="font-semibold text-slate-800 dark:text-slate-200">{addr.fullName}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  {addr.street}, {addr.city}, {addr.state} {addr.zip}, {addr.country}
                </p>
              </button>
            ))}
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 mt-4 pt-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">Or enter a new address:</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Full Name *"
          icon={FiUser}
          placeholder="John Doe"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <InputField
          label="Phone Number *"
          icon={FiPhone}
          placeholder="+1 (555) 000-0000"
          type="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
      </div>

      <InputField
        label="Street Address *"
        icon={FiMapPin}
        placeholder="123 Main Street, Apt 4B"
        error={errors.street?.message}
        {...register('street')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="City *"
          placeholder="New York"
          error={errors.city?.message}
          {...register('city')}
        />
        <InputField
          label="State *"
          placeholder="California or Telangana"
          error={errors.state?.message}
          {...register('state')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Country *
          </label>
          <div className="relative">
            <FiGlobe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              {...register('country')}
              className={`input-field pl-9 ${errors.country ? 'input-error' : ''}`}
            >
              <option value="">Select Country</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country.message}</p>}
        </div>
        <InputField
          label="ZIP / Postal Code *"
          placeholder="10001"
          error={errors.zip?.message}
          {...register('zip')}
        />
      </div>

      <button type="submit" className="btn-primary w-full py-3.5 justify-center">
        Continue to Order Summary →
      </button>
    </form>
  );
}
