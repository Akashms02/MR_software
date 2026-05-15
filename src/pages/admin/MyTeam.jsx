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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <StatCardGradient label="Team Members" value="23" type="teal" />
        <StatCardGradient label="Total Goals" value="14" type="orange" />
        <StatCardGradient label="Unaligned" value="12" type="coral" />
        <StatCardGradient label="Pending" value="09" type="purple" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
        
        {/* Individual Reports */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
               <div style={{ fontWeight: 800, fontSize: '15px' }}>Individual Reports {'>'} <span style={{ color: 'var(--lime-dark)' }}>Toppers</span></div>
               <ExternalLink size={16} color="var(--text-muted)" />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               {TEAM_MEMBERS.map((m, i) => (
                 <div key={i} style={{ 
                   padding: '20px', borderRadius: '16px', background: '#F9FAFB',
                   display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px'
                 }}>
                    <div style={{ display: 'flex', gap: '12px', gridColumn: 'span 2' }}>
                       <Avatar name={m.name} size={40} />
                       <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{m.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.role}</div>
                       </div>
                    </div>
                    <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                       <Badge type="processing">{m.role.includes('Lead') ? 'DE Cluster' : 'GM Cluster'}</Badge>
                    </div>
                    
                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                       <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Performance</div>
                       <div style={{ fontSize: '13px', fontWeight: 800, color: '#16a34a' }}>{m.performance}</div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                       <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Potential</div>
                       <div style={{ fontSize: '13px', fontWeight: 800, color: '#2196F3' }}>{m.potential}</div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                       <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Feedback</div>
                       <div style={{ fontSize: '13px', fontWeight: 800, color: '#F59E0B' }}>{m.feedback}</div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                       <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>FLPP</div>
                       <div style={{ fontSize: '13px', fontWeight: 800, color: '#EF4444' }}>{m.flpp}</div>
                    </div>
                 </div>
               ))}
            </div>
          </Card>

          {/* Team Members Rewards */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
               <div style={{ fontWeight: 800, fontSize: '15px' }}>Team Members {'>'} <span style={{ color: 'var(--lime-dark)' }}>Rewards</span></div>
               <button className="btn-lime" style={{ padding: '6px 12px', fontSize: '11px' }}>
                  <Share2 size={12} /> Share
               </button>
            </div>
            <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px', border: '2px dashed var(--border)', borderRadius: '16px' }}>
               Rewards table content placeholder
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
           
           {/* Points Budgeted Donut */}
           <Card style={{ padding: '24px' }}>
              <div style={{ fontWeight: 800, fontSize: '15px', marginBottom: '24px' }}>Points Budgeted</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 <div style={{ position: 'relative', width: '140px', height: '140px', marginBottom: '24px' }}>
                    <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                       <circle cx="18" cy="18" r="16" fill="none" stroke="#F3F4F6" strokeWidth="4" />
                       <circle cx="18" cy="18" r="16" fill="none" stroke="var(--lime)" strokeWidth="4" strokeDasharray="65 100" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                       <div style={{ fontSize: '24px', fontWeight: 800 }}>18877</div>
                       <div style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)' }}>REMAINING</div>
                    </div>
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
                    {[
                      { label: 'Points Alloted', val: '24000', color: 'var(--lime)' },
                      { label: 'Points Gained', val: '4923', color: '#2196F3' },
                      { label: 'Points Given', val: '200', color: '#F59E0B' },
                      { label: 'Points Available', val: '18877', color: '#10b981' },
                    ].map((p, i) => (
                      <div key={i}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.color }} />
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>{p.label}</span>
                         </div>
                         <div style={{ fontSize: '13px', fontWeight: 800, paddingLeft: '12px' }}>{p.val}</div>
                      </div>
                    ))}
                 </div>
              </div>
           </Card>

           {/* L&D Meetings */}
           <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                 <div style={{ fontWeight: 800, fontSize: '15px' }}>L&D Meetings</div>
                 <X size={16} color="var(--text-muted)" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 {[
                   { date: '03', month: 'Aug', title: 'Review Meeting - DE Cluster', sub: 'Review meeting with the DE Team', time: '12:30 PM', people: '12+ People' },
                   { date: '24', month: 'Aug', title: 'FLLP Review Board Meeting', sub: 'L&D meeting with the FLLP Team', time: '05:11 PM', people: '4 People' },
                 ].map((m, i) => (
                   <div key={i} style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(200, 240, 74, 0.1)', border: '1.5px solid var(--lime)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                         <div style={{ fontSize: '14px', fontWeight: 800 }}>{m.date}</div>
                         <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--lime-dark)' }}>{m.month}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                         <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{m.title}</div>
                         <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>{m.sub}</div>
                         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                               <div style={{ display: 'flex' }}>
                                  {[1,2,3].map(n => <div key={n} style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#eee', border: '1px solid #fff', marginLeft: n > 1 ? '-6px' : 0 }} />)}
                               </div>
                               <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>{m.people}</span>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>{m.time}</span>
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
