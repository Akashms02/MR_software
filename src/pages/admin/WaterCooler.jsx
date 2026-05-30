import React from 'react'
import { Card, Avatar, Badge } from '../../components/ui'
import { MoreHorizontal, MessageSquare, Heart, Share2, Calendar, Coffee, Bell, ChevronLeft, ChevronRight } from 'lucide-react'
import { FEED_POSTS } from '../../data/hrmsData'

export default function WaterCooler() {
  return (
    <div className="animate-fade">
      <div className="grid grid-cols-[1.2fr_0.8fr] gap-6">
        
        {/* ── Left Column: Feed ─────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          
          {/* Post Tabs & Input */}
          <Card className="p-6">
              <div className="flex gap-6 border-b border-border-light mb-5">
                 {['Post', 'Announcement', 'Poll', 'Praise'].map((t, i) => (
                   <button
                     key={t}
                     className={`px-1 pb-3 bg-transparent border-none font-bold text-sm cursor-pointer border-b-2 ${
                       i === 0 ? 'border-lime-dark text-primary' : 'border-transparent text-muted'
                     }`}
                   >
                     {t}
                   </button>
                 ))}
              </div>
              <textarea 
                placeholder="Write your post here..." 
                className="w-full min-h-[100px] border-none outline-none resize-none text-[15px] text-secondary bg-gray-50 rounded-xl p-4"
              />
              <div className="flex justify-end mt-4">
                 <button className="btn-lime">Post</button>
              </div>
          </Card>

          {/* Feed Posts */}
          {FEED_POSTS.map((post, i) => (
            <Card key={i} className="p-6">
              <div className="flex justify-between mb-5">
                 <div className="flex items-center gap-3">
                    <Avatar name={post.user} size={40} />
                    <div>
                       <div className="text-sm font-bold text-primary">{post.user}</div>
                       <div className="text-[11px] text-muted">{post.role}</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-muted">
                       <ChevronLeft size={14} /> {i+1} / 12 <ChevronRight size={14} />
                    </div>
                    <Badge type={post.type === 'Announcement' ? 'processing' : 'pending'}>{post.type}</Badge>
                 </div>
              </div>

              <div className="font-extrabold text-base text-primary mb-3">{post.title}</div>
              <p className="text-sm text-secondary leading-relaxed mb-5">{post.content}</p>

              {post.type === 'Poll' && (
                <div className="mb-6 flex flex-col gap-2.5">
                   {[
                     { label: 'Option A', pct: 65, color: 'var(--lime)' },
                     { label: 'Option B', pct: 25, color: '#F3F4F6' },
                     { label: 'Option C', pct: 10, color: '#F3F4F6' },
                   ].map((opt, j) => (
                     <div key={j} className="relative h-10 bg-gray-50 rounded-lg overflow-hidden">
                        <div style={{ width: `${opt.pct}%` }} className={`absolute left-0 top-0 bottom-0 transition-[width] duration-600 ${opt.color === 'var(--lime)' ? 'bg-lime' : 'bg-gray-200'}`} />
                        <div className="relative z-10 flex justify-between items-center h-full px-4 text-xs font-bold">
                           <span>{opt.label}</span>
                           <span>{opt.pct}%</span>
                        </div>
                     </div>
                   ))}
                </div>
              )}

              <div className="flex items-center gap-5 border-t border-border-light pt-4">
                 <button className="bg-transparent border-none flex items-center gap-1.5 text-muted text-[13px] cursor-pointer"><Heart size={18} /> 24</button>
                 <button className="bg-transparent border-none flex items-center gap-1.5 text-muted text-[13px] cursor-pointer"><MessageSquare size={18} /> 12</button>
                 <button className="bg-transparent border-none flex items-center gap-1.5 text-muted text-[13px] cursor-pointer"><Share2 size={18} /> 5</button>
                 <span className="ml-auto text-[11px] text-muted">{post.time}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* ── Right Column: Sidebar ─────────────────────────────── */}
        <div className="flex flex-col gap-6">
          
          {/* Holidays Card */}
          <div 
            className="h-[240px] rounded-[24px] overflow-hidden relative bg-cover bg-center flex flex-col justify-end p-6 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.8)),url(https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800&auto=format&fit=crop)]"
          >
             <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-[4px] rounded-full text-white text-[11px] font-bold">Holidays</div>
             <div className="text-white font-extrabold text-xl">Carnaval des Français</div>
             <div className="text-white/80 text-xs">Next: 14 Aug, 2026</div>
          </div>

          {/* On Leave Today */}
          <Card>
             <div className="flex justify-between mb-5">
                <div className="font-extrabold text-[15px]">On Leave Today</div>
                <ChevronRight size={16} className="text-muted" />
             </div>
             <div className="flex items-center gap-2">
                <div className="flex ml-1">
                   {[1,2,3,4].map(n => (
                     <div key={n} className="-ml-2 border-2 border-white rounded-full">
                        <Avatar name={`U ${n}`} size={32} />
                     </div>
                   ))}
                </div>
                <div className="text-xs text-muted">Diga, Diene, Garone <span className="font-bold text-primary">+5 others...</span></div>
             </div>
          </Card>

          {/* Pending Actions */}
          <Card>
             <div className="flex justify-between mb-5">
                <div className="font-extrabold text-[15px]">Pending Actions</div>
                <ChevronRight size={16} className="text-muted" />
             </div>
             <div className="bg-[#FFF8E8] p-3 rounded-xl flex gap-2.5">
                <div className="text-base">💡</div>
                <div className="text-xs text-secondary leading-normal">
                   <span className="font-extrabold text-primary">Reminder :</span> Agatha C. has requested a check-in from you. Check before 24th Aug.
                </div>
             </div>
          </Card>

          {/* Activities */}
          <Card>
             <div className="flex justify-between mb-5">
                <div className="font-extrabold text-[15px]">Activities</div>
                <ChevronRight size={16} className="text-muted" />
             </div>
             <div className="flex flex-col gap-4">
                {[
                  { icon: Coffee, title: 'Music Night', sub: 'Join session · On Skype', time: '12:30 PM' },
                  { icon: Calendar, title: 'Films we love', sub: 'Movie Night · In House', time: '05:15 PM' },
                ].map((act, i) => (
                  <div key={i} className="flex items-center gap-3">
                     <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-muted">
                        <act.icon size={18} />
                     </div>
                     <div className="flex-1">
                        <div className="text-[13px] font-bold text-primary">{act.title}</div>
                        <div className="text-[11px] text-muted">{act.sub}</div>
                     </div>
                     <div className="text-[11px] font-semibold text-muted">{act.time}</div>
                  </div>
                ))}
             </div>
          </Card>

        </div>
      </div>
    </div>
  )
}
