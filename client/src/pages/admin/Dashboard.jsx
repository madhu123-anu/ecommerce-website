import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="p-8 text-white min-h-screen bg-slate-900 space-y-4">
      <h1 className="text-2xl font-black">Admin Dashboard 📊</h1>
      <p className="text-slate-400 text-sm">Dashboard controls and stats are currently offline.</p>
      <div className="flex gap-4 pt-4">
        <Link to="/" className="btn-primary py-2 px-4 text-xs">Back to Main Site</Link>
      </div>
    </div>
  );
}
