"use client";

import {
  BarChart2,
  AlertTriangle,
  ShieldCheck,
  Book,
  FileText,
  Calendar,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function FacultyDashboard() {
  return (
    <div className="min-h-screen bg-[#0F1117] text-slate-200 p-4 md:p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-400 mt-1 md:mt-2 text-sm md:text-base">
              S8 Computer Science B • 2024-2025
            </p>
          </div>
          <button className="hidden md:flex items-center gap-2 border border-slate-700 bg-[#161922] hover:bg-slate-800 text-slate-300 text-sm px-4 py-2.5 rounded-xl transition-colors">
            <Calendar className="w-4 h-4" />
            <span>Academic Calendar</span>
          </button>
        </div>

        {/* Top Cards Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Class Average Points */}
          <div className="lg:col-span-2 bg-[#266DF0] rounded-2xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-lg shadow-blue-900/20">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-blue-100 text-xs md:text-sm font-semibold tracking-wider uppercase">
                  Class Average Points
                </h3>
                <BarChart2 className="w-5 h-5 text-blue-200/70" />
              </div>
              <div className="flex items-baseline gap-1 md:gap-2">
                <span className="text-5xl md:text-7xl font-bold text-white tracking-tighter">
                  85
                </span>
                <span className="text-xl md:text-2xl font-medium text-blue-200">
                  / 120
                </span>
              </div>
            </div>

            <div className="relative z-10 mt-8 md:mt-12 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2 bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-medium w-max">
                <TrendingUp className="w-4 h-4" />
                <span>+12% vs Last Sem</span>
              </div>
              <p className="text-blue-200 text-sm">
                35 points to go for 100% eligibility
              </p>
            </div>
          </div>

          {/* Students at Risk */}
          <div className="bg-[#181B25] border border-slate-800/60 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-slate-300 text-sm md:text-base font-medium">
                    Students at Risk
                  </h3>
                  <p className="text-slate-500 text-xs md:text-sm mt-1 sm:hidden md:block">
                    Below 40% threshold
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                  4
                </span>
                <button className="md:hidden flex items-center text-slate-400 hover:text-white">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="hidden md:block mt-8">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-red-500 rounded-full w-[15%]" />
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 mt-4">
                <span>Students below 40% of target points.</span>
                <button className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors">
                  View List <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <button className="col-span-2 lg:col-span-1 bg-[#181B25] border border-slate-800/60 hover:border-slate-700 hover:bg-[#1C202C] transition-all p-5 rounded-2xl text-left group relative outline-none focus:ring-2 focus:ring-blue-500">
              <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
                12 NEW
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-white font-semibold mb-1">
                Pending Verifications
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm line-clamp-2">
                Review activity certificates submitted by students.
              </p>
            </button>

            <button className="bg-[#181B25] border border-slate-800/60 hover:border-slate-700 hover:bg-[#1C202C] transition-all p-5 rounded-2xl text-left group outline-none focus:ring-2 focus:ring-blue-500">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Book className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">Student Ledger</h3>
              <p className="text-slate-400 text-xs sm:text-sm line-clamp-2">
                Access detailed master records of all 63 students.
              </p>
            </button>

            <button className="bg-[#181B25] border border-slate-800/60 hover:border-slate-700 hover:bg-[#1C202C] transition-all p-5 rounded-2xl text-left group outline-none focus:ring-2 focus:ring-blue-500">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart2 className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">Reports</h3>
              <p className="text-slate-400 text-xs sm:text-sm line-clamp-2">
                View analytics, participation trends and export data.
              </p>
            </button>

            <a
              href="https://drive.google.com/file/d/1vpcrkgoezTybaamxEZK00JJxwXbRHnBG/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:block bg-[#181B25] border border-slate-800/60 hover:border-slate-700 hover:bg-[#1C202C] transition-all p-5 rounded-2xl text-left group relative outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="absolute top-4 right-4 bg-slate-800 text-slate-300 text-xs font-medium px-2 py-0.5 rounded-md">
                2024 ED
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Book className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">KTU Rulebook</h3>
              <p className="text-slate-400 text-sm line-clamp-2">
                Official guidelines for activity point calculation.
              </p>
            </a>
          </div>
        </div>

        {/* Recent Updates */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Updates</h2>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
              <span className="hidden md:inline">View All History</span>
              <span className="md:hidden">View History</span>
            </button>
          </div>

          <div className="bg-[#181B25] border border-slate-800/60 rounded-2xl overflow-hidden divide-y divide-slate-800/60 flex flex-col md:bg-transparent md:border-0 md:divide-none md:gap-3">
            {/* Update Item 1 */}
            <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 md:hover:bg-[#1C202C] transition-colors md:bg-[#181B25] md:rounded-2xl md:border md:border-slate-800/60">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-5 h-5 text-slate-300" />
                </div>
                <div>
                  <p className="text-slate-200 text-sm md:text-base font-medium leading-snug">
                    <span className="text-white font-semibold">
                      Test User 4
                    </span>{" "}
                    submitted "NPTEL Cloud Computing" certificate.
                  </p>
                  <p className="text-slate-500 text-xs md:text-sm mt-1">
                    2 hours ago
                  </p>
                </div>
              </div>
              <button className="w-full md:w-auto px-4 py-2 border border-slate-700 bg-slate-800/30 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors ml-14 md:ml-0">
                Review
              </button>
            </div>

            {/* Update Item 2 */}
            <div className="p-4 md:p-5 flex gap-4 items-start md:items-center md:hover:bg-[#1C202C] transition-colors md:bg-[#181B25] md:rounded-2xl md:border md:border-slate-800/60">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-slate-200 text-sm md:text-base font-medium">
                  System auto-approved 5 recurring entries.
                </p>
                <p className="text-slate-500 text-xs md:text-sm mt-1">
                  Yesterday at 4:30 PM
                </p>
              </div>
            </div>

            {/* Update Item 3 */}
            <div className="p-4 md:p-5 flex gap-4 items-start md:items-center md:hover:bg-[#1C202C] transition-colors md:bg-[#181B25] md:rounded-2xl md:border md:border-slate-800/60">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-slate-200 text-sm md:text-base font-medium">
                  Semester deadline approaching in 14 days.
                </p>
                <p className="text-slate-500 text-xs md:text-sm mt-1">
                  System Notification
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info (Desktop only usually, but let's include it) */}
        <div className="pt-8 pb-4 text-center border-t border-slate-800/60 mt-8">
          <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-500 mb-2">
            <button className="hover:text-slate-300 transition-colors">
              Help Center
            </button>
            <button className="hover:text-slate-300 transition-colors">
              System Status
            </button>
            <button className="hover:text-slate-300 transition-colors">
              Contact Admin
            </button>
          </div>
          <p className="text-xs text-slate-600">
            © 2026 Tractivity System. Pukkaran Inc.
          </p>
        </div>
      </div>
    </div>
  );
}
