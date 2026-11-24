import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle2, RefreshCw, User, Shield, Search } from 'lucide-react';
import { apiRequest } from '../services/api';
import { socket } from '../services/socket';
import { useAdminToast } from '../context/AdminToastContext';

export default function AdminSupport() {
  const { addToast } = useAdminToast();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/inquiries');
      const list = res.tickets || [];
      setTickets(list);
      if (selectedTicket) {
        const refreshed = list.find(t => (t._id || t.ticketId) === (selectedTicket._id || selectedTicket.ticketId));
        if (refreshed) setSelectedTicket(refreshed);
      } else if (list.length > 0) {
        setSelectedTicket(list[0]);
      }
    } catch (e) {
      console.warn('[Fetch Support Tickets Error]', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();

    const handleNewInquiry = (ticket) => {
      addToast(`💬 New Support Message from ${ticket.name}!`, 'info');
      fetchTickets();
    };

    const handleNewMessage = (data) => {
      fetchTickets();
    };

    socket.on('inquiry:created', handleNewInquiry);
    socket.on('inquiry:message', handleNewMessage);

    const interval = setInterval(fetchTickets, 5000);

    return () => {
      socket.off('inquiry:created', handleNewInquiry);
      socket.off('inquiry:message', handleNewMessage);
      clearInterval(interval);
    };
  }, []);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    try {
      setSending(true);
      const res = await apiRequest(`/inquiries/${selectedTicket._id || selectedTicket.id}/message`, {
        method: 'POST',
        body: JSON.stringify({
          sender: 'admin',
          text: replyText.trim()
        })
      });

      if (res && res.ticket) {
        setSelectedTicket(res.ticket);
        setTickets(prev => prev.map(t => t._id === res.ticket._id ? res.ticket : t));
        setReplyText('');
        addToast('Reply sent to customer!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to send reply', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleResolveTicket = async (ticketId) => {
    try {
      const res = await apiRequest(`/inquiries/${ticketId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'resolved' })
      });
      if (res && res.ticket) {
        setSelectedTicket(res.ticket);
        setTickets(prev => prev.map(t => t._id === res.ticket._id ? res.ticket : t));
        addToast('Ticket marked as resolved!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
    }
  };

  const filtered = tickets.filter(t => {
    return (
      !search ||
      t.ticketId?.toLowerCase().includes(search.toLowerCase()) ||
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
            Customer Inquiries & Live Helpdesk
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Help & Live Support Chat
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time two-way messaging with customers across website storefront
          </p>
        </div>

        <button
          onClick={fetchTickets}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 self-start cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Tickets</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        
        {/* Ticket List (Left 4 cols) */}
        <div className="lg:col-span-4 p-4 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by ticket, name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[500px]">
            {loading && tickets.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">Loading tickets...</p>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No tickets found</p>
            ) : (
              filtered.map((ticket) => {
                const isSelected = (selectedTicket?._id || selectedTicket?.ticketId) === (ticket._id || ticket.ticketId);
                const lastMsg = ticket.messages?.[ticket.messages.length - 1];

                return (
                  <div
                    key={ticket._id || ticket.ticketId}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/50 shadow-md'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-white text-xs truncate">{ticket.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ticket.status === 'resolved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : ticket.unreadAdmin
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      }`}>
                        {ticket.status === 'resolved' ? 'Resolved' : ticket.unreadAdmin ? 'New Message' : 'Open'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate mb-1">
                      {ticket.subject}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-mono text-cyan-400/80">{ticket.ticketId}</span>
                      <span>{lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat / Ticket View (Right 8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          {selectedTicket ? (
            <>
              {/* Ticket Top bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">{selectedTicket.name}</h3>
                    <span className="text-xs text-slate-400 font-mono">({selectedTicket.email})</span>
                  </div>
                  <p className="text-xs text-cyan-400 font-mono mt-0.5">Ticket: #{selectedTicket.ticketId} • {selectedTicket.subject}</p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedTicket.status !== 'resolved' && (
                    <button
                      type="button"
                      onClick={() => handleResolveTicket(selectedTicket._id || selectedTicket.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Message thread */}
              <div className="flex-1 overflow-y-auto space-y-3 py-4 max-h-[360px] pr-2">
                {(selectedTicket.messages || []).map((msg, i) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div
                      key={i}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-500">
                        {isAdmin ? (
                          <>
                            <Shield className="w-3 h-3 text-cyan-400" />
                            <span className="text-cyan-400 font-bold">OG Support Admin</span>
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 text-emerald-400" />
                            <span className="text-slate-300 font-bold">{selectedTicket.name}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed ${
                        isAdmin
                          ? 'bg-cyan-600 text-white rounded-tr-none'
                          : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Input */}
              <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type official reply to customer..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sending ? 'Sending...' : 'Send Reply'}</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-xs">
              Select a support ticket to start chatting
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
