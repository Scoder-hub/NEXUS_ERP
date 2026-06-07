import React, { useState, useRef, useEffect } from 'react';
import {
  SearchIcon,
  SendIcon,
  PaperclipIcon,
  SmileIcon,
  PhoneIcon,
  VideoIcon,
  MoreHorizontalIcon,
  MessageSquareIcon,
  ImageIcon,
  FileIcon,
  CheckCheckIcon,
  PlusIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ChatContact, ChatMessage } from '../../types';

const CONTACTS: ChatContact[] = [
  { id: 'c1', name: `李明`, avatar: `LM`, role: `采购主管`, status: 'online', lastMessage: `好的，已收到采购单，我这边尽快处理`, lastTime: `09:42`, unread: 2 },
  { id: 'c2', name: `王芳`, avatar: `WF`, role: `销售经理`, status: 'busy', lastMessage: `客户那边确认下周三签合同`, lastTime: `昨天`, unread: 0 },
  { id: 'c3', name: `张伟`, avatar: `ZW`, role: `生产总监`, status: 'online', lastMessage: `3号车间工单完成率已超95%`, lastTime: `昨天`, unread: 5 },
  { id: 'c4', name: `陈晓`, avatar: `CX`, role: `财务主任`, status: 'away', lastMessage: `Q4财务报表已提交`, lastTime: `周一`, unread: 0 },
  { id: 'c5', name: `刘洋`, avatar: `LY`, role: `HR总监`, status: 'offline', lastMessage: `新员工入职培训安排已发邮件`, lastTime: `周日`, unread: 0 },
  { id: 'c6', name: `赵磊`, avatar: `ZL`, role: `研发工程师`, status: 'online', lastMessage: `新版接口已部署到测试环境`, lastTime: `上周`, unread: 0 },
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  c1: [
    { id: 'm1', contactId: 'c1', content: `李主管您好，请问上周的采购申请单审批进展如何？`, time: `09:30`, isMine: true, type: 'text' },
    { id: 'm2', contactId: 'c1', content: `你好！目前在走流程，财务部那边还需要再签一个章，预计今天下午能完成。`, time: `09:35`, isMine: false, type: 'text' },
    { id: 'm3', contactId: 'c1', content: `好的，谢谢！那原材料的备货时间需要提前通知供应商吗？`, time: `09:38`, isMine: true, type: 'text' },
    { id: 'm4', contactId: 'c1', content: `好的，已收到采购单，我这边尽快处理`, time: `09:42`, isMine: false, type: 'text' },
  ],
  c2: [
    { id: 'm5', contactId: 'c2', content: `王经理，华东客户那边签约进展如何？`, time: `昨天 15:20`, isMine: true, type: 'text' },
    { id: 'm6', contactId: 'c2', content: `客户那边确认下周三签合同`, time: `昨天 15:45`, isMine: false, type: 'text' },
  ],
  c3: [
    { id: 'm7', contactId: 'c3', content: `张总，3号车间本月完成情况怎么样？`, time: `昨天 10:00`, isMine: true, type: 'text' },
    { id: 'm8', contactId: 'c3', content: `3号车间工单完成率已超95%，全月预计可完成指标`, time: `昨天 10:15`, isMine: false, type: 'text' },
    { id: 'm9', contactId: 'c3', content: `另外设备保养计划也已排好，本周五停机维护4小时`, time: `昨天 10:16`, isMine: false, type: 'text' },
    { id: 'm10', contactId: 'c3', content: `好的，请务必保证生产安全`, time: `昨天 10:20`, isMine: true, type: 'text' },
    { id: 'm11', contactId: 'c3', content: `放心！安全第一`, time: `昨天 10:22`, isMine: false, type: 'text' },
  ],
  c4: [], c5: [], c6: [],
};

const statusColors = {
  online: 'var(--color-neon-green)',
  busy: 'var(--destructive)',
  away: '#fb923c',
  offline: '#64748b',
};

const statusLabels = { online: `在线`, busy: `忙碌`, away: `离开`, offline: `离线` };

const avatarColors = ['var(--color-primary-500)', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', 'var(--destructive)'];

const MessagesPage: React.FC = () => {
  const [contacts] = useState<ChatContact[]>(CONTACTS);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [activeContact, setActiveContact] = useState<string>('c1');
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeContact, messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      contactId: activeContact,
      content: input.trim(),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
      type: 'text',
    };
    setMessages(prev => ({
      ...prev,
      [activeContact]: [...(prev[activeContact] || []), newMsg],
    }));
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredContacts = contacts.filter(c =>
    !search || c.name.includes(search) || c.role.includes(search)
  );

  const activeContactData = contacts.find(c => c.id === activeContact);
  const activeMessages = messages[activeContact] || [];

  return (
    <div data-cmp="MessagesPage" className="flex flex-1 overflow-hidden">
      {/* Contacts sidebar */}
      <div className="flex flex-col flex-shrink-0" style={{ width: '300px', borderRight: '1px solid var(--border)', background: 'var(--theme-card-bg)' }}>
        {/* Search */}
        <div className="p-4 flex-shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base font-bold text-foreground flex-1 flex items-center gap-2">
              <MessageSquareIcon size={16} style={{ color: 'var(--primary)' }} />消息
            </h2>
            <button className="btn-interactive w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              <PlusIcon size={14} />
            </button>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'var(--input)', border: '1px solid var(--border)' }}>
            <SearchIcon size={13} style={{ color: 'var(--muted-foreground)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={`搜索联系人...`}
              className="flex-1 bg-transparent text-xs outline-none text-foreground" />
          </div>
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {filteredContacts.map((c, idx) => (
            <button key={c.id} onClick={() => setActiveContact(c.id)}
              className="btn-interactive w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 text-left"
              style={{
                background: activeContact === c.id ? 'rgba(129,140,248,0.1)' : 'transparent',
                border: activeContact === c.id ? '1px solid rgba(129,140,248,0.25)' : '1px solid transparent',
              }}>
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: avatarColors[idx % avatarColors.length] }}>
                  {c.avatar}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                  style={{ background: statusColors[c.status], borderColor: 'var(--theme-card-bg)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-foreground truncate flex-1">{c.name}</span>
                  <span className="text-xs flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>{c.lastTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs truncate flex-1" style={{ color: 'var(--muted-foreground)' }}>{c.lastMessage}</span>
                  {c.unread > 0 && (
                    <span className="text-xs px-1.5 rounded-full font-bold flex-shrink-0"
                      style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', minWidth: '18px', textAlign: 'center' }}>
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Chat header */}
        {activeContactData && (
          <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--theme-card-bg)' }}>
            <div className="relative">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                style={{ background: avatarColors[contacts.findIndex(c => c.id === activeContact) % avatarColors.length] }}>
                {activeContactData.avatar}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                style={{ background: statusColors[activeContactData.status], borderColor: 'var(--theme-card-bg)' }} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">{activeContactData.name}</div>
              <div className="text-xs" style={{ color: statusColors[activeContactData.status] }}>
                {statusLabels[activeContactData.status]} · {activeContactData.role}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[PhoneIcon, VideoIcon, MoreHorizontalIcon].map((Icon, i) => (
                <button key={i} className="icon-btn w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"
          style={{ background: 'var(--background)' }}>
          {activeMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 py-16">
              <MessageSquareIcon size={40} style={{ color: 'var(--muted-foreground)', opacity: 0.3 }} />
              <p className="text-sm mt-3" style={{ color: 'var(--muted-foreground)' }}>暂无对话记录，发送第一条消息吧</p>
            </div>
          )}
          {activeMessages.map(msg => (
            <div key={msg.id} className="flex gap-3" style={{ justifyContent: msg.isMine ? 'flex-end' : 'flex-start' }}>
              {!msg.isMine && (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                  style={{ background: avatarColors[contacts.findIndex(c => c.id === activeContact) % avatarColors.length] }}>
                  {activeContactData?.avatar}
                </div>
              )}
              <div className="flex flex-col" style={{ alignItems: msg.isMine ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                  style={msg.isMine
                    ? { background: 'var(--primary)', color: 'var(--primary-foreground)', borderBottomRightRadius: '4px' }
                    : { background: 'var(--theme-card-bg)', color: 'var(--foreground)', border: '1px solid var(--border)', borderBottomLeftRadius: '4px' }}>
                  {msg.content}
                </div>
                <div className="flex items-center gap-1 mt-0.5 px-1">
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{msg.time}</span>
                  {msg.isMine && <CheckCheckIcon size={11} style={{ color: 'var(--color-neon-cyan)' }} />}
                </div>
              </div>
              {msg.isMine && (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary-500), #06b6d4)' }}>
                  张
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border)', background: 'var(--theme-card-bg)' }}>
          <div className="flex items-end gap-2 px-3 py-2 rounded-2xl"
            style={{ background: 'var(--input)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-1 flex-shrink-0 pb-1">
              {[PaperclipIcon, ImageIcon, SmileIcon].map((Icon, i) => (
                <button key={i} className="icon-btn w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ color: 'var(--muted-foreground)' }}>
                  <Icon size={15} />
                </button>
              ))}
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`输入消息，Enter 发送，Shift+Enter 换行...`}
              rows={1}
              className="flex-1 bg-transparent text-sm outline-none text-foreground resize-none py-1"
              style={{ maxHeight: '120px' }}
            />
            <button onClick={handleSend}
              className="icon-btn w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: input.trim() ? 'var(--primary)' : 'var(--muted)', color: input.trim() ? 'var(--primary-foreground)' : 'var(--muted-foreground)' }}>
              <SendIcon size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
