"use client";

import { Check, Download, AlertCircle } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 lg:p-12 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-12 md:space-y-16 mt-4">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              KTU Activity Points 2024 Scheme
            </h1>
            <p className="text-foreground/60 text-sm md:text-base max-w-2xl mx-auto">
              Official Guide for B.Tech, B.Des, BBA & BCA Students
            </p>
          </div>

          <a
            href="https://drive.google.com/file/d/1vpcrkgoezTybaamxEZK00JJxwXbRHnBG/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 md:px-8 py-3 rounded-lg transition-colors w-full sm:w-auto mt-4"
          >
            <Download className="w-4 h-4" />
            <span>Download Handbook PDF</span>
          </a>
        </div>

        {/* Requirements Table Section */}
        <section className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-center pb-4 border-b border-border">
            Minimum Activity Points Required
          </h2>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm md:text-base text-left">
              <thead className="bg-[#181B25] text-blue-400 font-semibold border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-center">Category</th>
                  <th className="px-6 py-4 text-center border-x border-border">
                    Total Points
                  </th>
                  <th className="px-6 py-4 text-center">
                    Minimum per Group (I, II, III)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="bg-background hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 text-center font-medium">
                    Regular Students
                  </td>
                  <td className="px-6 py-4 text-center font-bold border-x border-border">
                    120
                  </td>
                  <td className="px-6 py-4 text-center">40 each</td>
                </tr>
                <tr className="bg-background hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 text-center font-medium text-foreground/80">
                    Lateral Entry
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-foreground/80 border-x border-border">
                    90
                  </td>
                  <td className="px-6 py-4 text-center text-foreground/80">
                    30 each
                  </td>
                </tr>
                <tr className="bg-background hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 text-center font-medium text-foreground/80">
                    PwD Students
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-foreground/80 border-x border-border">
                    60
                  </td>
                  <td className="px-6 py-4 text-center text-foreground/80">
                    20 each
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Activity Groups Grid */}
        <section className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-center pb-4 border-b border-border">
            The 3 Activity Groups
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Group I */}
            <div className="bg-[#181B25] border border-border rounded-xl p-6 hover:border-blue-500/50 transition-colors shadow-sm">
              <h3 className="text-blue-400 font-bold text-lg mb-4 leading-tight">
                Group I{" "}
                <span className="text-foreground/80 font-semibold">
                  – Social, Cultural & Leadership
                </span>
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-3 items-start">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-foreground/90 text-sm md:text-base leading-relaxed">
                    NSS, NCC, NSO, Sports, Arts, Games
                  </span>
                </li>
                <li className="flex gap-3 items-start">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-foreground/90 text-sm md:text-base leading-relaxed">
                    Community Service, Blood Donation, Tree Planting
                  </span>
                </li>
                <li className="flex gap-3 items-start">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-foreground/90 text-sm md:text-base leading-relaxed">
                    College Union roles, Magazine publication
                  </span>
                </li>
                <li className="flex gap-3 items-start">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-foreground/90 text-sm md:text-base leading-relaxed">
                    Swimming/First Aid training, Leadership camps
                  </span>
                </li>
                <li className="flex gap-3 items-start pt-2">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-foreground font-bold text-sm md:text-base leading-relaxed">
                    Minimum: 40 Points
                  </span>
                </li>
              </ul>
            </div>

            {/* Group II */}
            <div className="bg-[#181B25] border border-border rounded-xl p-6 hover:border-blue-500/50 transition-colors shadow-sm">
              <h3 className="text-blue-400 font-bold text-lg mb-4 leading-tight">
                Group II{" "}
                <span className="text-foreground/80 font-semibold">
                  – Technical & Professional Development
                </span>
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-3 items-start">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-foreground/90 text-sm md:text-base leading-relaxed">
                    Tech Fests, Paper Presentations, Professional Societies
                    (IEEE, SAE...)
                  </span>
                </li>
                <li className="flex gap-3 items-start">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-foreground/90 text-sm md:text-base leading-relaxed">
                    Short-term Internships (min 2 weeks = 10 pts)
                  </span>
                </li>
                <li className="flex gap-3 items-start">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-foreground/90 text-sm md:text-base leading-relaxed">
                    English Proficiency (TOEFL, IELTS), Aptitude (GATE, CAT,
                    GRE...)
                  </span>
                </li>
                <li className="flex gap-3 items-start">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-foreground/90 text-sm md:text-base leading-relaxed">
                    IEDC, Placement Cell, FOSS/ICFOSS activities
                  </span>
                </li>
                <li className="flex gap-3 items-start pt-2">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-foreground font-bold text-sm md:text-base leading-relaxed">
                    Minimum: 40 Points
                  </span>
                </li>
              </ul>
            </div>

            {/* Group III */}
            <div className="bg-[#181B25] border border-border rounded-xl p-6 hover:border-blue-500/50 transition-colors shadow-sm">
              <h3 className="text-blue-400 font-bold text-lg mb-4 leading-tight">
                Group III{" "}
                <span className="text-foreground/80 font-semibold">
                  – Innovation, Research & Entrepreneurship
                </span>
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-3 items-start">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-foreground/90 text-sm md:text-base leading-relaxed">
                    National/International Hackathons (winners up to 40 pts)
                  </span>
                </li>
                <li className="flex gap-3 items-start">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-foreground/90 text-sm md:text-base leading-relaxed">
                    Long-term Internships, Startups, Patents
                  </span>
                </li>
                <li className="flex gap-3 items-start">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-foreground/90 text-sm md:text-base leading-relaxed">
                    Journal Publications, Prototypes, Skilling Courses (1
                    point/hour)
                  </span>
                </li>
                <li className="flex gap-3 items-start pt-2 mt-auto">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-foreground font-bold text-sm md:text-base leading-relaxed">
                    Minimum: 40 Points
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Submission Rules & Official Guidelines */}
        <section className="space-y-8 pt-4">
          {/* How to Submit */}
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-center pb-4 border-b border-border mb-6">
              How to Submit Activity Points
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {[
                "Maintain a personal file with all certificates & proofs every semester",
                "Get verification & signature from Senior Faculty Advisor (SFA) each semester",
                "Colleges consolidate & upload summary to KTU portal",
                "Final semester results may be withheld if points are incomplete",
              ].map((text, i) => (
                <div
                  key={i}
                  className="flex gap-3 items-center bg-[#181B25]/50 p-3 md:p-4 rounded-lg border border-border/50"
                >
                  <div className="w-2 h-2 bg-foreground rounded-full shrink-0 hidden sm:block mx-2" />
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-foreground/90 text-sm md:text-base">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Important Rules Dropdown/Card */}
          <div className="max-w-4xl mx-auto bg-blue-950/20 border border-blue-900/40 rounded-2xl overflow-hidden p-1">
            <div className="bg-background/80 backdrop-blur-sm rounded-xl p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-center text-blue-500 mb-8">
                Important Rules from Official Handbook
              </h2>

              <div className="space-y-5">
                {[
                  "Only activities completed during the programme duration are eligible",
                  "Participation + Winning in same event → only winning points count (highest level only)",
                  "Fake or fraudulent documents = points cancellation + strict disciplinary action",
                  "Skilling courses = 1 point per hour (only university-approved courses – check KTU list)",
                  "Keep personal Activity Points File updated & submit to SFA regularly",
                ].map((text, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-2 h-2 bg-foreground rounded-full shrink-0 hidden sm:block mx-1 mt-2.5" />
                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-foreground/90 text-sm md:text-base leading-relaxed">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
