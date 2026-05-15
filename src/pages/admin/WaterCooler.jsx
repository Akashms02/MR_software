import React from 'react'
import { Card, Avatar, Badge } from '../../components/ui'
import { MoreHorizontal, MessageSquare, Heart, Share2, Calendar, Coffee, Bell, ChevronLeft, ChevronRight } from 'lucide-react'
import { FEED_POSTS } from '../../data/hrmsData'

export default function WaterCooler() {
  return (
    <div className="animate-fade">
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
        
        {/* ── Left Column: Feed ─────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Post Tabs & Input */}
          <Card style={{ padding: '24px' }}>
             <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border-light)', marginBottom: '20px' }}>
                {['Post', 'Announcement', 'Poll', 'Praise'].map((t, i) => (
                  <button key={t} style={{ 
                    padding: '0 4px 12px 4px', background: 'transparent', border: 'none', 
                    borderBottom: i === 0 ? '2px solid var(--lime-dark)' : '2px solid transparent',
                    color: i === 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: 700, fontSize: '14px', cursor: 'pointer'
                  }}>{t}</button>
                ))}
             </div>
             <textarea 
               placeholder="Write your post here..." 
               style={{ 
                 width: '100%', minHeight: '100px', border: 'none', outline: 'none', 
                 resize: 'none', fontSize: '15px', color: 'var(--text-secondary)',
                 background: '#F9FAFB', borderRadius: '12px', padding: '16px'
               }}
             />
             <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button className="btn-lime">Post</button>
             </div>
          </Card>

          {/* Feed Posts */}
          {FEED_POSTS.map((post, i) => (
            <Card key={i} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar name={post.user} size={40} />
                    <div>
                       <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{post.user}</div>
                       <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{post.role}</div>
                    </div>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                       <ChevronLeft size={14} /> {i+1} / 12 <ChevronRight size={14} />
                    </div>
                    <Badge type={post.type === 'Announcement' ? 'processing' : 'pending'}>{post.type}</Badge>
                 </div>
              </div>

              <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '12px' }}>{post.title}</div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>{post.content}</p>

              {post.type === 'Poll' && (
                <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   {[
                     { label: 'Option A', pct: 65, color: 'var(--lime)' },
                     { label: 'Option B', pct: 25, color: '#F3F4F6' },
                     { label: 'Option C', pct: 10, color: '#F3F4F6' },
                   ].map((opt, j) => (
                     <div key={j} style={{ position: 'relative', height: '40px', background: '#F9FAFB', borderRadius: '8px', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${opt.pct}%`, background: opt.color, transition: 'width 0.6s' }} />
                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%', padding: '0 16px', fontSize: '12px', fontWeight: 700 }}>
                           <span>{opt.label}</span>
                           <span>{opt.pct}%</span>
                        </div>
                     </div>
                   ))}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                 <button style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer' }}><Heart size={18} /> 24</button>
                 <button style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer' }}><MessageSquare size={18} /> 12</button>
                 <button style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer' }}><Share2 size={18} /> 5</button>
                 <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)' }}>{post.time}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* ── Right Column: Sidebar ─────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Holidays Card */}
          <div style={{ 
            height: '240px', borderRadius: '24px', overflow: 'hidden', position: 'relative',
            background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8)), url(https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800&auto=format&fit=crop)',
            backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '24px'
          }}>
             <div style={{ position: 'absolute', top: '16px', left: '16px', padding: '4px 12px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', borderRadius: '100px', color: '#fff', fontSize: '11px', fontWeight: 700 }}>Holidays</div>
             <div style={{ color: '#fff', fontWeight: 800, fontSize: '20px' }}>Carnaval des Français</div>
             <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Next: 14 Aug, 2026</div>
          </div>

          {/* On Leave Today */}
          <Card>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ fontWeight: 800, fontSize: '15px' }}>On Leave Today</div>
                <ChevronRight size={16} color="var(--text-muted)" />
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', marginLeft: '4px' }}>
                   {[1,2,3,4].map(n => (
                     <div key={n} style={{ marginLeft: '-8px', border: '2px solid #fff', borderRadius: '50%' }}>
                        <Avatar name={`U ${n}`} size={32} />
                     </div>
                   ))}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Diga, Diene, Garone <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>+5 others...</span></div>
             </div>
          </Card>

          {/* Pending Actions */}
          <Card>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ fontWeight: 800, fontSize: '15px' }}>Pending Actions</div>
                <ChevronRight size={16} color="var(--text-muted)" />
             </div>
             <div style={{ background: '#FFF8E8', padding: '12px', borderRadius: '12px', display: 'flex', gap: '10px' }}>
                <div style={{ fontSize: '16px' }}>💡</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                   <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Reminder :</span> Agatha C. has requested a check-in from you. Check before 24th Aug.
                </div>
             </div>
          </Card>

          {/* Activities */}
          <Card>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ fontWeight: 800, fontSize: '15px' }}>Activities</div>
                <ChevronRight size={16} color="var(--text-muted)" />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { icon: Coffee, title: 'Music Night', sub: 'Join session · On Skype', time: '12:30 PM' },
                  { icon: Calendar, title: 'Films we love', sub: 'Movie Night · In House', time: '05:15 PM' },
                ].map((act, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                     <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <act.icon size={18} />
                     </div>
                     <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{act.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{act.sub}</div>
                     </div>
                     <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>{act.time}</div>
                  </div>
                ))}
             </div>
          </Card>

        </div>
      </div>
    </div>
  )
}
