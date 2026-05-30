import React from 'react'
import { Card, StatCardGradient, Avatar, InfoBanner, Badge } from '../../components/ui'
import { ChevronRight, ExternalLink, Share2, MoreHorizontal, Users, Target, Clock, AlertCircle, X } from 'lucide-react'
import { TEAM_MEMBERS } from '../../data/hrmsData'

export default function MyTeam() {
  return (
    <div className="animate-fade">
      {/* ── Info Banner ────────────────────────────────────────── */}
      <InfoBanner 
        icon="🔔"
        text="Agatha C. has requested a check-in from you. Check before 24th Aug."
        actionLabel="Check Now!"
        onAction={() => alert('Check-in initiated')}
      />

      {/* ── Stat Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCardGradient label="Team Members" value="23" type="teal" />
        <StatCardGradient label="Total Goals" value="14" type="orange" />
        <StatCardGradient label="Unaligned" value="12" type="coral" />
        <StatCardGradient label="Pending" value="09" type="purple" />
      </div>

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-6">
        
        {/* Individual Reports */}
        <div className="flex flex-col gap-6">
          <Card>
            <div className="flex justify-between mb-6">
               <div className="font-extrabold text-[15px]">Individual Reports {'>'} <span className="text-lime-dark">Toppers</span></div>
               <ExternalLink size={16} className="text-muted" />
            </div>
            
            <div className="flex flex-col gap-5">
               {TEAM_MEMBERS.map((m, i) => (
                 <div key={i} className="p-5 rounded-2xl bg-gray-50 grid grid-cols-4 gap-4">
                    <div className="flex gap-3 col-span-2">
                       <Avatar name={m.name} size={40} />
                       <div>
                          <div className="text-sm font-bold text-primary">{m.name}</div>
                          <div className="text-[11px] text-muted">{m.role}</div>
                       </div>
                    </div>
                    <div className="col-span-2 flex justify-end items-center">
                       <Badge type="processing">{m.role.includes('Lead') ? 'DE Cluster' : 'GM Cluster'}</Badge>
                    </div>
                    
                    <div className="border-t border-border-light pt-3">
                       <div className="text-[10px] font-semibold text-muted uppercase mb-1">Performance</div>
                       <div className="text-[13px] font-extrabold text-green-600">{m.performance}</div>
                    </div>
                    <div className="border-t border-border-light pt-3">
                       <div className="text-[10px] font-semibold text-muted uppercase mb-1">Potential</div>
                       <div className="text-[13px] font-extrabold text-blue-500">{m.potential}</div>
                    </div>
                    <div className="border-t border-border-light pt-3">
                       <div className="text-[10px] font-semibold text-muted uppercase mb-1">Feedback</div>
                       <div className="text-[13px] font-extrabold text-amber-500">{m.feedback}</div>
                    </div>
                    <div className="border-t border-border-light pt-3">
                       <div className="text-[10px] font-semibold text-muted uppercase mb-1">FLPP</div>
                       <div className="text-[13px] font-extrabold text-red-500">{m.flpp}</div>
                    </div>
                 </div>
               ))}
            </div>
          </Card>

          {/* Team Members Rewards */}
          <Card>
            <div className="flex justify-between mb-6">
               <div className="font-extrabold text-[15px]">Team Members {'>'} <span className="text-lime-dark">Rewards</span></div>
               <button className="btn-lime px-3 py-1.5 text-[11px]">
                  <Share2 size={12} /> Share
               </button>
            </div>
            <div className="h-[120px] flex items-center justify-center text-muted text-[13px] border-2 border-dashed border-border rounded-2xl">
               Rewards table content placeholder
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
           
           {/* Points Budgeted Donut */}
           <Card className="p-6">
              <div className="font-extrabold text-[15px] mb-6">Points Budgeted</div>
              <div className="flex flex-col items-center">
                 <div className="relative w-[140px] h-[140px] mb-6">
                    <svg viewBox="0 0 36 36" className="-rotate-90">
                       <circle cx="18" cy="18" r="16" fill="none" stroke="#F3F4F6" strokeWidth="4" />
                       <circle cx="18" cy="18" r="16" fill="none" stroke="var(--lime)" strokeWidth="4" strokeDasharray="65 100" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <div className="text-2xl font-extrabold">18877</div>
                       <div className="text-[9px] font-semibold text-muted">REMAINING</div>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 w-full">
                     {[
                       { label: 'Points Alloted', val: '24000', bgClass: 'bg-lime' },
                       { label: 'Points Gained', val: '4923', bgClass: 'bg-blue-500' },
                       { label: 'Points Given', val: '200', bgClass: 'bg-amber-500' },
                       { label: 'Points Available', val: '18877', bgClass: 'bg-emerald-500' },
                     ].map((p, i) => (
                       <div key={i}>
                          <div className="flex items-center gap-1.5 mb-0.5">
                             <div className={`w-1.5 h-1.5 rounded-full ${p.bgClass}`} />
                             <span className="text-[10px] text-muted font-semibold">{p.label}</span>
                          </div>
                          <div className="text-[13px] font-extrabold pl-3">{p.val}</div>
                       </div>
                     ))}
                 </div>
              </div>
           </Card>

           {/* L&D Meetings */}
           <Card>
              <div className="flex justify-between mb-5">
                 <div className="font-extrabold text-[15px]">L&D Meetings</div>
                 <X size={16} className="text-muted" />
              </div>
              <div className="flex flex-col gap-4">
                 {[
                   { date: '03', month: 'Aug', title: 'Review Meeting - DE Cluster', sub: 'Review meeting with the DE Team', time: '12:30 PM', people: '12+ People' },
                   { date: '24', month: 'Aug', title: 'FLLP Review Board Meeting', sub: 'L&D meeting with the FLLP Team', time: '05:11 PM', people: '4 People' },
                 ].map((m, i) => (
                   <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-lime/10 border-[1.5px] border-lime flex flex-col items-center justify-center shrink-0">
                         <div className="text-sm font-extrabold">{m.date}</div>
                         <div className="text-[9px] font-bold text-lime-dark">{m.month}</div>
                      </div>
                      <div className="flex-1">
                         <div className="text-[13px] font-bold text-primary">{m.title}</div>
                         <div className="text-[11px] text-muted mb-2">{m.sub}</div>
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                               <div className="flex">
                                  {[1,2,3].map(n => <div key={n} className={`w-4 h-4 rounded-full bg-gray-200 border border-white ${n > 1 ? '-ml-1.5' : ''}`} />)}
                               </div>
                               <span className="text-[10px] font-bold text-muted">{m.people}</span>
                            </div>
                            <span className="text-[11px] font-semibold text-muted">{m.time}</span>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  )
}
