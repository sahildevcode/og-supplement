import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, User, Shield, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { socket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function SupportChatWidget() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // Sync user info if logged in
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  // Load existing ticket if saved in localStorage
  useEffect(() => {
    const savedTicketId = localStorage.getItem('og_support_ticket_id');
    if (savedTicketId) {
      apiRequest(`/inquiries?email=${user?.email || ''}`)
        .then((res) => {
          const list = res.tickets || [];
          const found = list.find(t => t.ticketId === savedTicketId || t._id === savedTicketId) || list[0];
          if (found) {
            setActiveTicket(found);
            if (found.unreadCustomer) setHasUnread(true);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Socket listener for new messages
  useEffect(() => {
    const handleInquiryMessage = (data) => {
      if (activeTicket && (data.ticketId === activeTicket.ticketId || data._id === (activeTicket._id || activeTicket.id))) {
        setActiveTicket(data.updated || activeTicket);
        if (data.sender === 'admin') {
          setHasUnread(true);
        }
      }
    };

    socket.on('inquiry:message', handleInquiryMessage);
    return () => {
      socket.off('inquiry:message', handleInquiryMessage);
    };
  }, [activeTicket]);

  const handleStartInquiry = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    try {
      setSending(true);
      const res = await apiRequest('/inquiries', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          subject: subject.trim() || 'Product & Order Support',
          message: message.trim()
        })
      });

      if (res && res.ticket) {
        setActiveTicket(res.ticket);
        localStorage.setItem('og_support_ticket_id', res.ticket.ticketId);
        setMessage('');
      }
    } catch (err) {
      console.warn('[Start Inquiry Error]', err.message);
    } finally {
      setSending(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    try {
      setSending(true);
      const res = await apiRequest(`/inquiries/${activeTicket._id || activeTicket.id}/message`, {
        method: 'POST',
        body: JSON.stringify({
          sender: 'customer',
          text: replyText.trim()
        })
      });

      if (res && res.ticket) {
        setActiveTicket(res.ticket);
        setReplyText('');
      }
    } catch (err) {
      console.warn('[Customer Reply Error]', err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating Support Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setHasUnread(false);
          }}
          className="relative px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-2xl flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
        >
          <MessageSquare className="w-5 h-5 fill-slate-950" />
          <span>Support & Help</span>
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full animate-ping" />
          )}
        </button>
      </div>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[380px] rounded-3xl bg-slate-950/95 backdrop-blur-xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[540px]">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-between text-white">
            <div>
              <h3 className="font-black text-sm flex items-center gap-1.5">
                <Shield className="w-4 h-4 fill-white" />
                <span>OG Support Official</span>
              </h3>
              <p className="text-[10px] text-emerald-100">Live replies from brand verified team</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-black/20 text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            {activeTicket ? (
              <>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-emerald-400 block">Ticket: #{activeTicket.ticketId}</span>
                  <span className="text-xs text-slate-300 font-bold">{activeTicket.subject}</span>
                </div>

                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {(activeTicket.messages || []).map((m, i) => {
                    const isUser = m.sender === 'customer';
                    return (
                      <div key={i} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                        <span className="text-[9px] text-slate-500 mb-0.5">
                          {isUser ? 'You' : 'OG Support Specialist'}
                        </span>
                        <div className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                          isUser
                            ? 'bg-emerald-600 text-white rounded-tr-none'
                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                        }`}>
                          {m.text}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSendReply} className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={sending || !replyText.trim()}
                    className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            ) : (
              <form onSubmit={handleStartInquiry} className="space-y-2.5">
                <p className="text-xs text-slate-300 font-semibold mb-2">
                  Have a question about your order, delivery, or authenticity? Ask us directly:
                </p>

                <input
                  type="text"
                  required
                  placeholder="Your Full Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />

                <input
                  type="email"
                  required
                  placeholder="Your Email Address *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />

                <input
                  type="tel"
                  placeholder="Phone Number (Optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />

                <input
                  type="text"
                  placeholder="Subject / Order ID (e.g. Order #OG-2024)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />

                <textarea
                  required
                  rows={3}
                  placeholder="How can we assist you today? *"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sending ? 'Starting Conversation...' : 'Start Support Chat'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
