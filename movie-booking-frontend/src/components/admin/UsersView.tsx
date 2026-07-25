"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ShieldAlert, Trash2, Shield, User, Search } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function UsersView() {
  const [users, setUsers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");

  const [adminFormData, setAdminFormData] = useState({
    name: "", email: "", phone: "", password: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const [uRes, aRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/auth/admins`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUsers(uRes.data);
      setAdmins(aRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (id: string, currentlyBlocked: boolean) => {
    if (!confirm(`Are you sure you want to ${currentlyBlocked ? "unblock" : "block"} this user?`)) return;
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(`${API_URL}/api/admin/users/${id}/block`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert("Failed to change user status");
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm("Are you sure you want to delete this admin?")) return;
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`${API_URL}/api/auth/admins/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert("Failed to delete admin");
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminFormData.password.length < 6) return alert("Password must be at least 6 characters");
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(`${API_URL}/api/auth/admins`, adminFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdminFormData({ name: "", email: "", phone: "", password: "" });
      fetchData();
      alert("Admin created successfully!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create admin");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.includes(searchTerm)
  );

  if (loading) return <div className="text-zinc-500 animate-pulse">Loading Users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">Users & Access</h2>
          <p className="text-zinc-500 mt-1">Manage user safety and system administrators</p>
        </div>
      </div>

      <div className="flex space-x-2">
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
          onClick={() => setActiveTab('users')}
        >
          <User className="inline w-4 h-4 mr-2" />
          Customers
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'admins' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
          onClick={() => setActiveTab('admins')}
        >
          <Shield className="inline w-4 h-4 mr-2" />
          Administrators
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map(u => (
              <div key={u._id} className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl hover:border-zinc-700 transition-colors flex flex-col">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg text-white">{u.name}</h4>
                      <p className="text-xs text-zinc-500">{u.email || u.phone}</p>
                    </div>
                    {u.isBlocked && <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-1 rounded text-xs font-bold uppercase">Blocked</span>}
                 </div>
                 
                 <div className="mt-auto pt-4 border-t border-zinc-800 flex justify-between items-center">
                    <span className="text-xs text-zinc-500">Joined {new Date(u.createdAt).toLocaleDateString()}</span>
                    <button 
                      onClick={() => handleToggleBlock(u._id, u.isBlocked)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center ${
                        u.isBlocked ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                      }`}
                    >
                      <ShieldAlert className="w-3 h-3 mr-1.5" />
                      {u.isBlocked ? 'Unblock' : 'Block User'}
                    </button>
                 </div>
              </div>
            ))}
            {filteredUsers.length === 0 && <p className="col-span-full py-8 text-center text-zinc-500">No users found.</p>}
          </div>
        </div>
      )}

      {activeTab === 'admins' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl h-fit">
             <h3 className="text-xl font-bold mb-4 text-white">Add New Admin</h3>
             <form onSubmit={handleCreateAdmin} className="space-y-4">
               <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Full Name</label>
                  <input required type="text" value={adminFormData.name} onChange={e => setAdminFormData({...adminFormData, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500" />
               </div>
               <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Email Address</label>
                  <input required type="email" value={adminFormData.email} onChange={e => setAdminFormData({...adminFormData, email: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500" />
               </div>
               <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Phone (Optional)</label>
                  <input type="tel" value={adminFormData.phone} onChange={e => setAdminFormData({...adminFormData, phone: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500" />
               </div>
               <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Password</label>
                  <input required type="password" value={adminFormData.password} onChange={e => setAdminFormData({...adminFormData, password: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500" minLength={6} />
               </div>
               <button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2 rounded-lg transition-colors mt-2">
                 Create Administrator
               </button>
             </form>
          </div>
          
          <div className="lg:col-span-2 space-y-4">
             {admins.map(a => (
               <div key={a._id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mr-4 text-xl font-bold text-zinc-300">
                      {a.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{a.name} <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded uppercase">Admin</span></h4>
                      <p className="text-sm text-zinc-400">{a.email}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteAdmin(a._id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20">
                    <Trash2 className="w-5 h-5" />
                  </button>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
}
