import React, { useState } from 'react';
import { 
  SupportTicket, 
  TicketCategory, 
  TicketStatus, 
  Language, 
  CountryConfig, 
  TicketPriority,
  TicketMessage
} from '../types';
import { SAMPLE_SUPPORT_TICKETS } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';
import { 
  Headphones, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Send, 
  UserCheck, 
  User, 
  Building2, 
  Bike, 
  ShieldCheck, 
  Plus, 
  X, 
  ChevronRight,
  AlertCircle,
  Sparkles,
  Phone,
  Paperclip,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SupportDashboardProps {
  tickets?: SupportTicket[];
  language: Language;
  selectedCountry: CountryConfig;
}

export const SupportDashboard: React.FC<SupportDashboardProps> = ({
  tickets: initialTickets = SAMPLE_SUPPORT_TICKETS,
  language,
  selectedCountry,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [ticketList, setTicketList] = useState<SupportTicket[]>(initialTickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string>(initialTickets[0]?.id || '');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
  
  // New Message State
  const [replyText, setReplyText] = useState('');
  
  // New Ticket Modal State
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TicketCategory>('customer_complaint');
  const [newPriority, setNewPriority] = useState<TicketPriority>('high');
  const [newRaisedBy, setNewRaisedBy] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const selectedTicket = ticketList.find((t) => t.id === selectedTicketId) || ticketList[0];

  const filteredTickets = ticketList.filter((t) => {
    const matchesSearch = 
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.raisedBy.toLowerCase().includes(search.toLowerCase()) ||
      (t.assignedOfficer && t.assignedOfficer.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const openCount = ticketList.filter((t) => t.status === 'open').length;
  const inProgressCount = ticketList.filter((t) => t.status === 'in_progress').length;
  const resolvedCount = ticketList.filter((t) => t.status === 'resolved').length;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    const newMessage: TicketMessage = {
      id: `msg-${Date.now()}`,
      ticketId: selectedTicket.id,
      senderId: 'support-agent-01',
      senderName: 'Dr. Sarah Al-Mansoor (Senior Support Specialist)',
      senderRole: 'support',
      message: replyText.trim(),
      timestamp: 'Just now'
    };

    const updated = {
      ...selectedTicket,
      status: selectedTicket.status === 'open' ? ('in_progress' as TicketStatus) : selectedTicket.status,
      messages: [...(selectedTicket.messages || []), newMessage]
    };

    setTicketList((prev) => prev.map((t) => (t.id === selectedTicket.id ? updated : t)));
    setReplyText('');
  };

  const handleUpdateStatus = (status: TicketStatus) => {
    if (!selectedTicket) return;
    setTicketList((prev) =>
      prev.map((t) => (t.id === selectedTicket.id ? { ...t, status } : t))
    );
  };

  const handleUpdatePriority = (priority: TicketPriority) => {
    if (!selectedTicket) return;
    setTicketList((prev) =>
      prev.map((t) => (t.id === selectedTicket.id ? { ...t, priority } : t))
    );
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newRaisedBy.trim() || !newDesc.trim()) return;

    const newTicket: SupportTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      category: newCategory,
      title: newTitle.trim(),
      description: newDesc.trim(),
      raisedBy: newRaisedBy.trim(),
      userRole: 'customer',
      contactPhone: newPhone.trim() || '+254 700 000 000',
      priority: newPriority,
      status: 'open',
      createdAt: 'Just now',
      assignedOfficer: 'Dispatch Operations Lead',
      messages: [
        {
          id: `msg-${Date.now()}`,
          ticketId: `tkt-${Date.now()}`,
          senderId: 'usr-new',
          senderName: newRaisedBy.trim(),
          senderRole: 'customer',
          message: newDesc.trim(),
          timestamp: 'Just now'
        }
      ]
    };

    setTicketList([newTicket, ...ticketList]);
    setSelectedTicketId(newTicket.id);
    setIsNewTicketOpen(false);
    setNewTitle('');
    setNewRaisedBy('');
    setNewPhone('');
    setNewDesc('');
  };

  const getPriorityBadge = (p: TicketPriority) => {
    switch (p) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">URGENT</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-900 border border-orange-200">HIGH</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">NORMAL</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-800">LOW</span>;
    }
  };

  const getStatusBadge = (s: TicketStatus) => {
    switch (s) {
      case 'open':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-200 flex items-center gap-1"><Clock className="w-3 h-3 text-rose-600" /> Open</span>;
      case 'in_progress':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1"><Sparkles className="w-3 h-3 text-blue-600" /> In Progress</span>;
      case 'resolved':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Resolved</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-800">Closed</span>;
    }
  };

  return (
    <div className="space-y-6" id="support-dashboard-root">
      {/* Header Banner */}
      <div className="bg-[#1B4332] text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#2D6A4F]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#74C69D] text-xs font-bold border border-white/15 mb-2">
            <Headphones className="w-4 h-4 text-[#74C69D]" />
            <span>24/7 Clinical & Operational Support Command</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {language === 'ar' ? 'مركز دعم العملاء والشركاء' : 'Support Desk & Escalation Hub'}
          </h2>
          <p className="text-xs text-[#D8F3DC]/80 mt-0.5">
            SLA Response Time: <strong className="text-white">&lt; 4 mins</strong> • Active Market: {selectedCountry.name}
          </p>
        </div>

        <button
          onClick={() => setIsNewTicketOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-[#74C69D] hover:bg-[#52B788] text-[#1B4332] text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Open Ticket</span>
        </button>
      </div>

      {/* SLA Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#D8E2DC] shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-neutral-600">Open Tickets</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-900">{openCount}</p>
          <p className="text-[11px] text-rose-600 font-medium mt-0.5">Requires first response</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#D8E2DC] shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-neutral-600">In Resolution</span>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-900">{inProgressCount}</p>
          <p className="text-[11px] text-blue-600 font-medium mt-0.5">Assigned to specialists</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#D8E2DC] shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-neutral-600">Resolved Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-[#1B4332]">{resolvedCount}</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">99.4% CSAT Rating</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#D8E2DC] shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-neutral-600">Total Volume</span>
            <Headphones className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <p className="text-2xl font-black text-neutral-900">{ticketList.length}</p>
          <p className="text-[11px] text-neutral-500 font-medium mt-0.5">Across all channels</p>
        </div>
      </div>

      {/* Main Support Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tickets List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-3.5 rounded-2xl border border-[#D8E2DC] shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticket #, title, user, officer..."
                className="w-full ps-9 pe-3 py-2 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl font-bold text-neutral-700"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl font-bold text-neutral-700"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[650px] overflow-y-auto pe-1">
            {filteredTickets.map((ticket) => {
              const isSelected = selectedTicket?.id === ticket.id;

              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#E8F5E9] border-[#52B788] shadow-sm'
                      : 'bg-white border-[#D8E2DC] hover:border-[#95D5B2]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-[#2D6A4F]">{ticket.ticketNumber}</span>
                      {getPriorityBadge(ticket.priority)}
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>

                  <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">{ticket.title}</h4>
                  <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">{ticket.description}</p>

                  <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-2 mt-2 border-t border-neutral-100">
                    <span className="font-semibold">{ticket.raisedBy} ({ticket.userRole})</span>
                    <span>{ticket.createdAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Ticket Thread (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#D8E2DC] shadow-xs overflow-hidden flex flex-col h-[740px]">
          {selectedTicket ? (
            <>
              {/* Ticket Header */}
              <div className="p-5 border-b border-neutral-100 bg-[#F8FAF9] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-[#1B4332]">{selectedTicket.ticketNumber}</span>
                    {getPriorityBadge(selectedTicket.priority)}
                    {getStatusBadge(selectedTicket.status)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {selectedTicket.status !== 'resolved' ? (
                      <button
                        onClick={() => handleUpdateStatus('resolved')}
                        className="px-3 py-1.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#74C69D]" />
                        <span>Resolve Ticket</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus('in_progress')}
                        className="px-3 py-1.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Re-Open
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-black text-[#1B4332]">{selectedTicket.title}</h3>
                  <p className="text-xs text-neutral-600 mt-1">
                    Raised by: <strong className="text-neutral-900">{selectedTicket.raisedBy}</strong> ({selectedTicket.contactPhone}) &bull; Category: <span className="font-semibold capitalize">{selectedTicket.category.replace('_', ' ')}</span> &bull; Officer: <span className="text-[#2D6A4F] font-bold">{selectedTicket.assignedOfficer || 'General Queue'}</span>
                  </p>
                </div>
              </div>

              {/* Messages Timeline */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-white">
                {/* Initial Description */}
                <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#166534] space-y-1">
                  <p className="font-bold">Initial Issue Statement:</p>
                  <p className="text-neutral-800 leading-relaxed">{selectedTicket.description}</p>
                </div>

                {selectedTicket.messages && selectedTicket.messages.map((msg) => {
                  const isAgent = msg.senderRole === 'support' || msg.senderRole === 'admin';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-bold text-neutral-500">{msg.senderName}</span>
                        <span className="text-[9px] text-neutral-400">&bull; {msg.timestamp}</span>
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl text-xs max-w-lg leading-relaxed ${
                          isAgent
                            ? 'bg-[#1B4332] text-white rounded-br-none shadow-xs'
                            : 'bg-[#F4F7F5] border border-[#D8E2DC] text-neutral-800 rounded-bl-none'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-neutral-100 bg-[#F8FAF9] flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your official clinical support response..."
                  className="flex-1 px-4 py-2.5 bg-white border border-[#D8E2DC] rounded-xl text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] disabled:opacity-40 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 text-[#74C69D]" />
                  <span>Send Reply</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center text-neutral-400">
              <Headphones className="w-12 h-12 mb-2 text-neutral-300" />
              <p className="text-sm font-bold text-neutral-600">Select a ticket to inspect and reply</p>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {isNewTicketOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#D8E2DC]"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-[#2D6A4F]" />
                  <h3 className="text-base font-black text-[#1B4332]">Open Support / Complaint Ticket</h3>
                </div>
                <button onClick={() => setIsNewTicketOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Issue Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7F5] border border-[#D8E2DC] font-semibold text-neutral-800"
                  >
                    <option value="customer_complaint">Customer Complaint</option>
                    <option value="pharmacy_complaint">Pharmacy Inquiry</option>
                    <option value="driver_complaint">Courier / Driver Problem</option>
                    <option value="missing_item">Missing Item</option>
                    <option value="wrong_item">Wrong Item Dispensed</option>
                    <option value="payment_issue">Payment Issue</option>
                    <option value="delivery_problem">Delivery Problem</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delayed insulin delivery"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7F5] border border-[#D8E2DC] text-neutral-800 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Raised By (Name) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Grace Muthoni"
                      value={newRaisedBy}
                      onChange={(e) => setNewRaisedBy(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7F5] border border-[#D8E2DC] text-neutral-800 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      placeholder="+254 700..."
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7F5] border border-[#D8E2DC] text-neutral-800 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7F5] border border-[#D8E2DC] font-semibold text-neutral-800"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Detailed Description *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide full issue details..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7F5] border border-[#D8E2DC] text-neutral-800"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setIsNewTicketOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-neutral-600 hover:bg-neutral-100 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold shadow-xs cursor-pointer"
                  >
                    Log Ticket
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
