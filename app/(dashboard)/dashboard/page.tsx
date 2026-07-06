"use client";

import React from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  UserRound, 
  MessageSquare, 
  TrendingUp, 
  MoreHorizontal,
  Search,
  Bell,
  Plus
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Mock Data
const revenueData = [
  { name: 'Mon', income: 4000 },
  { name: 'Tue', income: 3000 },
  { name: 'Wed', income: 5000 },
  { name: 'Thu', income: 2780 },
  { name: 'Fri', income: 6890 },
  { name: 'Sat', income: 2390 },
  { name: 'Sun', income: 3490 },
];

const appointments = [
  { id: 1, patient: "Sarah Johnson", time: "09:00 AM", type: "Checkup", status: "Confirmed", img: "https://i.pravatar.cc/150?u=1" },
  { id: 2, patient: "Michael Chen", time: "10:30 AM", type: "Dental", status: "Pending", img: "https://i.pravatar.cc/150?u=2" },
  { id: 3, patient: "Emma Wilson", time: "01:00 PM", type: "Vaccination", status: "Confirmed", img: "https://i.pravatar.cc/150?u=3" },
];

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {trend > 0 ? '+' : ''}{trend}%
      </span>
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

export default function ClinicDashboard() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      
      {/* Sidebar - Optional but included for context */}
      <aside className="w-64 border-r border-slate-200 bg-white hidden lg:flex flex-col p-6 space-y-8">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Plus size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">MediFlow</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          {['Dashboard', 'Patients', 'Appointments', 'Staff', 'Messages', 'Settings'].map((item) => (
            <button key={item} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${item === 'Dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
              {item}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 ml-0 overflow-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, Dr. Smith</h1>
            <p className="text-slate-500">Heres whats happening in your clinic today.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
            <button className="relative p-2 bg-white border border-slate-200 rounded-xl text-slate-600">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Income" value="$12,450" icon={DollarSign} trend={12} color="bg-indigo-500" />
          <StatCard title="Total Patients" value="1,284" icon={Users} trend={8} color="bg-emerald-500" />
          <StatCard title="Appointments" value="42" icon={Calendar} trend={-2} color="bg-amber-500" />
          <StatCard title="Active Staff" value="18" icon={UserRound} trend={0} color="bg-blue-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800">Revenue Overview</h3>
              <select className="text-sm bg-slate-50 border-none rounded-lg p-1 text-slate-500 focus:ring-0">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800">Recent Appointments</h3>
              <button className="text-indigo-600 text-sm font-medium hover:underline">View all</button>
            </div>
            <div className="space-y-6">
              {appointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={apt.img} alt={apt.patient} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{apt.patient}</p>
                      <p className="text-xs text-slate-500">{apt.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-800">{apt.time}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      apt.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messages Preview */}
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare size={20} className="text-indigo-600" />
              <h3 className="font-bold text-slate-800">Unread Messages</h3>
              <span className="ml-2 bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">3 New</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((m) => (
                <div key={m} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400">2 mins ago</span>
                    <MoreHorizontal size={14} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600">Dr. James Miller</p>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-1">Regarding the lab results for patient Sarah...</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}