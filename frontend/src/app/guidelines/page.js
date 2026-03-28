

import { Check, Download, BookOpen, Info, ShieldCheck, GraduationCap, ClipboardCheck, ExternalLink } from "lucide-react";
import ActivityGroupCard from "@/components/ActivityGroupCard";

export default function GuidelinesPage() {
  const activityGroups = [
    {
      group: "Group I",
      title: "Social, Cultural & Leadership",
      minPoints: "40 Points",
      items: [
        "NSS, NCC, NSO, Sports, Arts, Games",
        "Community Service, Blood Donation, Tree Planting",
        "College Union roles, Magazine publication",
        "Swimming/First Aid training, Leadership camps",
      ],
    },
    {
      group: "Group II",
      title: "Technical & Professional Development",
      minPoints: "40 Points",
      items: [
        "Tech Fests, Paper Presentations, Professional Societies (IEEE, SAE...)",
        "Short-term Internships (min 2 weeks = 10 pts)",
        "English Proficiency (TOEFL, IELTS), Aptitude (GATE, CAT, GRE...)",
        "IEDC, Placement Cell, FOSS/ICFOSS activities",
      ],
    },
    {
      group: "Group III",
      title: "Innovation, Research & Entrepreneurship",
      minPoints: "40 Points",
      items: [
        "National/International Hackathons (winners up to 40 pts)",
        "Long-term Internships, Startups, Patents",
        "Journal Publications, Prototypes, Skilling Courses (1 point/hour)",
      ],
    },
  ];

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-background">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto p-6 md:p-10">
        {/* Header Section */}
          <div className="text-center space-y-8 mb-20 animate-in fade-in duration-500">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 mb-2">
               <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-background" />
               </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]">
              KTU Activity Points <span className="text-foreground/60 font-light">2024 Scheme</span>
            </h1>
            <p className="text-sm md:text-base text-foreground/75 max-w-2xl mx-auto font-light leading-relaxed">
              The official guide for B.Tech, B.Des, BBA & BCA Students to navigate the Mandatory Student Activity (MSA) requirements.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://drive.google.com/file/d/1vpcrkgoezTybaamxEZK00JJxwXbRHnBG/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-3 bg-foreground text-background font-bold px-8 py-4 rounded-2xl hover:bg-foreground/90 transition-all w-full sm:w-auto shadow-2xl shadow-foreground/10 active:scale-[0.98]"
            >
              <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
              <span className="text-sm uppercase tracking-widest">Download Official Handbook</span>
            </a>
          </div>
        </div>

        {/* Requirements Table Section */}
        <section className="mb-24 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-75">
           <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-border/50 flex items-center justify-center">
                 <ClipboardCheck className="w-5 h-5 text-foreground/60" />
              </div>
              <h2 className="text-2xl font-display font-medium tracking-tight">Minimum Requirements</h2>
           </div>

           <div className="bg-secondary/5 border border-border/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/30 bg-secondary/5">
                      <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-foreground/60">Category of Admission</th>
                      <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-foreground/60 border-x border-border/30 text-center">Total Points Required</th>
                      <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-foreground/60 text-center">Min per Group (I, II, III)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    <tr className="hover:bg-secondary/5 transition-colors">
                      <td className="px-8 py-6">
                        <span className="text-lg font-display font-medium text-foreground/80">Regular Degree</span>
                        <p className="text-[10px] text-foreground/30 uppercase tracking-widest font-bold mt-1">4 Year Programme</p>
                      </td>
                      <td className="px-8 py-6 border-x border-border/30 text-center">
                        <span className="text-3xl font-display font-bold text-foreground">120</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-lg font-display font-medium text-foreground/60">40 Points</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-secondary/5 transition-colors">
                      <td className="px-8 py-6">
                        <span className="text-lg font-display font-medium text-foreground/80">Lateral Entry</span>
                        <p className="text-[10px] text-foreground/30 uppercase tracking-widest font-bold mt-1">3 Year Programme</p>
                      </td>
                      <td className="px-8 py-6 border-x border-border/30 text-center">
                        <span className="text-3xl font-display font-bold text-foreground/50">90</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-lg font-display font-medium text-foreground/40">30 Points</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-secondary/5 transition-colors">
                      <td className="px-8 py-6">
                        <span className="text-lg font-display font-medium text-foreground/80">PwD Students</span>
                        <p className="text-[10px] text-foreground/30 uppercase tracking-widest font-bold mt-1">Inclusive Admissions</p>
                      </td>
                      <td className="px-8 py-6 border-x border-border/30 text-center">
                        <span className="text-3xl font-display font-bold text-foreground/40">60</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-lg font-display font-medium text-foreground/30">20 Points</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
           </div>
        </section>

        {/* Activity Groups Grid */}
        <section className="mb-24 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
           <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-border/50 flex items-center justify-center">
                 <BookOpen className="w-5 h-5 text-foreground/60" />
              </div>
              <h2 className="text-2xl font-display font-medium tracking-tight">Activity Groups Breakdown</h2>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {activityGroups.map((group, index) => (
              <ActivityGroupCard key={index} {...group} />
            ))}
          </div>
        </section>

        {/* Submission Rules Section */}
        <section className="mb-24 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* How to Submit */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-border/50 flex items-center justify-center">
                    <Info className="w-5 h-5 text-foreground/60" />
                 </div>
                 <h2 className="text-2xl font-display font-medium tracking-tight">Submission Protocol</h2>
              </div>
              
              <div className="space-y-4">
                {[
                  "Maintain a curated personal file with all digital/physical certificates.",
                  "Obtain verification and sign-off from your Faculty Advisor each semester.",
                  "Colleges consolidate and finalize submissions on the KTU portal annually.",
                  "Note: Graduation may be delayed if the minimum points requirement is unfulfilled."
                ].map((text, i) => (
                  <div
                    key={i}
                    className="group flex gap-4 p-5 bg-secondary/5 border border-border/30 rounded-2xl hover:border-border transition-all backdrop-blur-sm"
                  >
                    <div className="shrink-0 w-6 h-6 rounded-full bg-foreground/5 flex items-center justify-center text-[10px] font-bold text-foreground/40 group-hover:bg-foreground group-hover:text-background transition-colors">
                      {i + 1}
                    </div>
                    <p className="text-sm text-foreground/70 leading-relaxed font-light">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Crucial Rules */}
            <div className="p-8 bg-secondary/5 border border-border/50 rounded-4xl">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                       <ShieldCheck className="w-4 h-4 text-background" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-foreground">Activity Rules & Policies</h3>
                 </div>
                 <ul className="space-y-6">
                    <li className="flex gap-4 items-start">
                       <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground/40 shrink-0" />
                       <p className="text-sm text-foreground/75 leading-relaxed font-light">
                          Activities must be completed <span className="text-foreground font-medium">outside of academic hours</span>.
                       </p>
                    </li>
                    <li className="flex gap-4 items-start">
                       <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground/40 shrink-0" />
                       <p className="text-sm text-foreground/75 leading-relaxed font-light">
                          Points are calculated based on <span className="text-foreground font-medium">levels</span> (National, State, Zonal, College).
                       </p>
                    </li>
                    <li className="flex gap-4 items-start">
                       <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground/40 shrink-0" />
                       <p className="text-sm text-foreground/75 leading-relaxed font-light">
                          Submission of fraudulent documents leads to <span className="text-foreground font-medium">permanent points forfeiture</span>.
                       </p>
                    </li>
                    <li className="flex gap-4 items-start">
                       <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground/40 shrink-0" />
                       <p className="text-sm text-foreground/75 leading-relaxed font-light">
                          Skilling courses must be <span className="text-foreground font-medium">University-approved</span> (Refer to the official list).
                       </p>
                    </li>
                 </ul>

                <div className="pt-6">
                   <a 
                    href="https://ktu.edu.in" 
                    target="_blank" 
                    className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                   >
                     Visit official portal
                     <ExternalLink className="w-3.5 h-3.5" />
                   </a>
                </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Branding */}
      <div className="py-20 border-t border-border/20 text-center relative z-10 bg-secondary/5">
        <p className="text-[10px] text-foreground/20 uppercase tracking-[0.5em] font-medium pointer-events-none">
          Powered by Tracktivity
        </p>
      </div>
    </div>
  );
}
