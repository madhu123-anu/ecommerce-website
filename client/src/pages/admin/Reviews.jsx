import { Link } from 'react-router-dom';

export default function AdminReviews() {
  return (
    <div className="p-8 text-white min-h-screen bg-slate-900 space-y-4">
      <h1 className="text-2xl font-black">Admin Review Management 💬</h1>
      <p className="text-slate-400 text-sm">Review moderation controls are offline.</p>
      <Link to="/admin" className="text-primary-400 text-xs font-semibold hover:underline">← Back to Admin</Link>
    </div>
  );
}
