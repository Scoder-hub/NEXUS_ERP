import React, { useState } from 'react';
import {
  SparklesIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  RefreshCwIcon,
  DownloadIcon,
  CopyIcon,
  ChevronRightIcon,
  FileTextIcon,
  ImageIcon,
  CodeIcon,
  ZapIcon,
  TrendingUpIcon,
  ListIcon,
} from 'lucide-react';
import { toast } from 'sonner';

/* ── Types ──────────────────────────────────────────────────────────────── */
type TaskStatus = 'running' | 'completed' | 'pending' | 'failed';
type TaskType   = 'text' | 'image' | 'code' | 'report';

interface GenerationTask {
  id: string;
  name: string;
  type: TaskType;
  status: TaskStatus;
  progress: number;
  model: string;
  createdAt: string;
  duration: string;
  tokens: number;
}

/* ── Mock data ──────────────────────────────────────────────────────────── */
const TASKS: GenerationTask[] = [
  { id: 'T-001', name: `Q3 销售报告摘要`, type: 'report', status: 'completed', progress: 100, model: `GPT-4o`,     createdAt: `2024-06-18 09:14`, duration: `2.3s`,  tokens: 1842 },
  { id: 'T-002', name: `产品描述批量生成`, type: 'text',   status: 'running',   progress: 67,  model: `Claude-3.5`, createdAt: `2024-06-18 10:02`, duration: `–`,     tokens: 3204 },
  { id: 'T-003', name: `数据可视化代码`,   type: 'code',   status: 'completed', progress: 100, model: `GPT-4o`,     createdAt: `2024-06-18 10:31`, duration: `1.8s`,  tokens: 986  },
  { id: 'T-004', name: `促销海报文案`,     type: 'text',   status: 'pending',   progress: 0,   model: `Gemini Pro`, createdAt: `2024-06-18 11:00`, duration: `–`,     tokens: 0    },
  { id: 'T-005', name: `供应商合同草拟`,   type: 'text',   status: 'failed',    progress: 23,  model: `GPT-4o`,     createdAt: `2024-06-17 16:44`, duration: `–`,     tokens: 420  },
  { id: 'T-006', name: `库存分析报告`,     type: 'report', status: 'completed', progress: 100, model: `Claude-3.5`, createdAt: `2024-06-17 14:20`, duration: `3.1s`,  tokens: 2311 },
  { id: 'T-007', name: `营销邮件模板`,     type: 'text',   status: 'running',   progress: 41,  model: `Gemini Pro`, createdAt: `2024-06-18 11:15`, duration: `–`,     tokens: 780  },
  { id: 'T-008', name: `API 文档生成`,     type: 'code',   status: 'pending',   progress: 0,   model: `GPT-4o`,     createdAt: `2024-06-18 11:30`, duration: `–`,     tokens: 0    },
];

const PROMPT_TEMPLATES = [
  { id: 1, name: `销售日报摘要`,     desc: `自动汇总当日销售数据生成可读摘要`,   icon: TrendingUpIcon, color: 'var(--color-neon-green)' },
  { id: 2, name: `采购单说明`,       desc: `根据采购清单生成供应商沟通邮件`,     icon: FileTextIcon,   color: 'var(--color-neon-cyan)' },
  { id: 3, name: `数据分析脚本`,     desc: `生成 Python/SQL 数据处理代码片段`,   icon: CodeIcon,       color: 'var(--color-neon-purple)' },
  { id: 4, name: `产品批量描述`,     desc: `为产品库批量生成 SEO 友好文案`,     icon: ListIcon,       color: 'var(--color-neon-yellow)' },
];

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const typeIcon: Record<TaskType, React.ElementType> = {
  text:   FileTextIcon,
  image:  ImageIcon,
  code:   CodeIcon,
  report: TrendingUpIcon,
};

const typeColor: Record<TaskType, string> = {
  text:   'var(--color-neon-cyan)',
  image:  '#f472b6',
  code:   'var(--color-neon-purple)',
  report: 'var(--color-neon-green)',
};

const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  running:   { label: `运行中`, color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',   Icon: PlayIcon         },
  completed: { label: `已完成`, color: 'var(--color-neon-green)', bg: 'rgba(52,211,153,0.12)',   Icon: CheckCircleIcon  },
  pending:   { label: `等待中`, color: 'var(--color-neon-yellow)', bg: 'rgba(251,191,36,0.12)',   Icon: ClockIcon        },
  failed:    { label: `失败`,   color: 'var(--destructive)', bg: 'rgba(244,63,94,0.12)',    Icon: AlertCircleIcon  },
};

/* ── Stat card ───────────────────────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  color: string;
  Icon: React.ElementType;
}
const StatCard: React.FC<StatCardProps> = ({ label, value, sub, color, Icon }) => (
  <div
    className="glass-card p-4 flex-1"
    style={{ minWidth: 0, border: `1px solid ${color}22` }}
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ background: `${color}20` }}
      >
        <Icon size={14} style={{ color }} />
      </div>
    </div>
    <div className="text-xl font-bold text-foreground">{value}</div>
    <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{sub}</div>
  </div>
);

/* ── Main component ──────────────────────────────────────────────────────── */
const GenerationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'templates' | 'compose'>('tasks');
  const [promptText, setPromptText] = useState('');
  const [selectedModel, setSelectedModel] = useState('GPT-4o');
  const [generatedOutput, setGeneratedOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const totalTokens = TASKS.reduce((s, t) => s + t.tokens, 0);
  const completedCount = TASKS.filter(t => t.status === 'completed').length;
  const runningCount   = TASKS.filter(t => t.status === 'running').length;

  const handleGenerate = () => {
    if (!promptText.trim()) return;
    setIsGenerating(true);
    setGeneratedOutput('');
    console.log(`[GenerationPage] 开始生成，模型: ${selectedModel}, 提示词: ${promptText}`);
    setTimeout(() => {
      setGeneratedOutput(
        `【生成结果 · ${selectedModel}】\n\n根据您的指令「${promptText}」，系统已完成内容生成。\n\n` +
        `本次生成内容涵盖关键业务节点与数据洞察，建议结合实际场景进行二次审校后使用。\n` +
        `预计节省手工撰写时间约 45 分钟，Tokens 消耗：1,024。`
      );
      setIsGenerating(false);
    }, 2000);
  };

  const models = ['GPT-4o', 'Claude-3.5', 'Gemini Pro'];

  return (
    <div data-cmp="GenerationPage" className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--color-neon-fuchsia), var(--color-neon-purple))', boxShadow: '0 0 20px rgba(232,121,249,0.4)' }}
          >
            <SparklesIcon size={18} style={{ color: 'white' }} />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">生成管理</h2>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>AI 驱动的内容生成与任务调度中心</p>
          </div>
        </div>
        <button
          className="btn-interactive flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
          style={{
            background: 'linear-gradient(135deg, var(--color-neon-fuchsia), var(--color-neon-purple))',
            color: 'white',
            boxShadow: '0 4px 16px rgba(232,121,249,0.35)',
          }}
          onClick={() => setActiveTab('compose')}
        >
          <ZapIcon size={13} />
          新建生成任务
        </button>
      </div>

      {/* Stat row */}
      <div className="flex gap-4">
        <StatCard label={`总任务数`}  value={`${TASKS.length}`}            sub={`本月累计`}        color="var(--color-neon-fuchsia)" Icon={SparklesIcon}    />
        <StatCard label={`已完成`}    value={`${completedCount}`}           sub={`成功率 75%`}      color="var(--color-neon-green)" Icon={CheckCircleIcon} />
        <StatCard label={`运行中`}    value={`${runningCount}`}             sub={`实时处理`}        color="#60a5fa" Icon={PlayIcon}        />
        <StatCard label={`Token 消耗`} value={`${(totalTokens/1000).toFixed(1)}K`} sub={`本月合计`} color="var(--color-neon-yellow)" Icon={ZapIcon}         />
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl"
        style={{ background: 'var(--theme-input-bg)', border: '1px solid var(--theme-input-border)', width: 'fit-content' }}
      >
        {(['tasks', 'templates', 'compose'] as const).map(tab => {
          const labels = { tasks: `任务列表`, templates: `提示模板`, compose: `在线生成` };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="btn-interactive px-4 py-1.5 rounded-lg text-xs font-medium"
              style={{
                background: activeTab === tab ? 'var(--primary)' : 'transparent',
                color: activeTab === tab ? 'white' : 'var(--muted-foreground)',
              }}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* Task list tab */}
      <div style={{ display: activeTab === 'tasks' ? 'block' : 'none' }}>
        <div className="glass-card overflow-hidden">
          {/* Table header */}
          <div
            className="flex items-center gap-3 px-5 py-3 text-xs font-semibold"
            style={{
              borderBottom: '1px solid var(--theme-divider)',
              color: 'var(--muted-foreground)',
            }}
          >
            <span style={{ width: '80px', flexShrink: 0 }}>任务 ID</span>
            <span style={{ flex: 1 }}>任务名称</span>
            <span style={{ width: '80px', flexShrink: 0 }}>类型</span>
            <span style={{ width: '100px', flexShrink: 0 }}>模型</span>
            <span style={{ width: '140px', flexShrink: 0 }}>进度</span>
            <span style={{ width: '72px', flexShrink: 0, textAlign: 'center' }}>状态</span>
            <span style={{ width: '80px', flexShrink: 0 }}>Tokens</span>
            <span style={{ width: '40px', flexShrink: 0 }}></span>
          </div>

          {TASKS.map((task, idx) => {
            const TypeIcon = typeIcon[task.type];
            const tColor   = typeColor[task.type];
            const sc       = statusConfig[task.status];
            const StatusIcon = sc.Icon;
            return (
              <div
                key={task.id}
                className="flex items-center gap-3 px-5 py-3.5 transition-all duration-150"
                style={{
                  borderBottom: idx < TASKS.length - 1 ? '1px solid var(--theme-divider)' : 'none',
                  background: 'transparent',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--theme-card-bg)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* ID */}
                <span className="text-xs font-mono font-semibold" style={{ width: '80px', flexShrink: 0, color: 'var(--muted-foreground)' }}>
                  {task.id}
                </span>

                {/* Name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="text-sm font-medium text-foreground truncate block">{task.name}</span>
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{task.createdAt}</span>
                </div>

                {/* Type */}
                <div className="flex items-center gap-1" style={{ width: '80px', flexShrink: 0 }}>
                  <TypeIcon size={12} style={{ color: tColor }} />
                  <span className="text-xs" style={{ color: tColor }}>{task.type}</span>
                </div>

                {/* Model */}
                <span className="text-xs font-medium" style={{ width: '100px', flexShrink: 0, color: 'var(--muted-foreground)' }}>
                  {task.model}
                </span>

                {/* Progress bar */}
                <div style={{ width: '140px', flexShrink: 0 }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{task.progress}%</span>
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{task.duration}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--theme-input-bg)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${task.progress}%`,
                        background: task.status === 'failed'
                          ? 'var(--destructive)'
                          : `linear-gradient(90deg, var(--color-neon-fuchsia), var(--color-neon-purple))`,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Status badge */}
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ width: '72px', flexShrink: 0, background: sc.bg, justifyContent: 'center' }}
                >
                  <StatusIcon size={10} style={{ color: sc.color }} />
                  <span className="text-xs font-medium" style={{ color: sc.color }}>{sc.label}</span>
                </div>

                {/* Tokens */}
                <span className="text-xs font-mono" style={{ width: '80px', flexShrink: 0, color: 'var(--muted-foreground)' }}>
                  {task.tokens > 0 ? task.tokens.toLocaleString() : `–`}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1" style={{ width: '40px', flexShrink: 0 }}>
                  <button
                    className="btn-interactive w-6 h-6 rounded-md flex items-center justify-center"
                    style={{ background: 'var(--theme-btn-bg)', color: 'var(--muted-foreground)' }}
                  >
                    <ChevronRightIcon size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Templates tab */}
      <div style={{ display: activeTab === 'templates' ? 'block' : 'none' }}>
        <div className="flex flex-wrap gap-4">
          {PROMPT_TEMPLATES.map(tpl => {
            const TplIcon = tpl.icon;
            return (
              <div
                key={tpl.id}
                className="glass-card glass-card-hover p-4 cursor-pointer"
                style={{ width: 'calc(50% - 8px)', border: `1px solid ${tpl.color}22` }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${tpl.color}20` }}
                  >
                    <TplIcon size={18} style={{ color: tpl.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground mb-1">{tpl.name}</div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{tpl.desc}</div>
                  </div>
                </div>
                <button
                  className="btn-interactive mt-4 w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                  style={{ background: `${tpl.color}18`, color: tpl.color, border: `1px solid ${tpl.color}30` }}
                  onClick={() => {
                    setPromptText(tpl.name);
                    setActiveTab('compose');
                  }}
                >
                  <PlayIcon size={11} />
                  使用此模板
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compose tab */}
      <div style={{ display: activeTab === 'compose' ? 'block' : 'none' }}>
        <div className="flex gap-4">
          {/* Left: prompt input */}
          <div className="flex-1 space-y-4">
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-foreground">提示词</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>模型：</span>
                  {models.map(m => (
                    <button
                      key={m}
                      onClick={() => setSelectedModel(m)}
                      className="btn-interactive px-2.5 py-1 rounded-lg text-xs font-medium"
                      style={{
                        background: selectedModel === m ? 'rgba(232,121,249,0.2)' : 'var(--theme-btn-bg)',
                        color: selectedModel === m ? 'var(--color-neon-fuchsia)' : 'var(--muted-foreground)',
                        border: selectedModel === m ? '1px solid rgba(232,121,249,0.4)' : '1px solid var(--theme-btn-border)',
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
                placeholder={`描述您需要生成的内容，例如：根据本周销售数据生成一份简洁的执行摘要...`}
                rows={5}
                className="w-full bg-transparent text-sm text-foreground outline-none resize-none placeholder-gray-500"
                style={{
                  background: 'var(--theme-input-bg)',
                  border: '1px solid var(--theme-input-border)',
                  borderRadius: '0.75rem',
                  padding: '12px',
                  lineHeight: 1.6,
                }}
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {promptText.length} 字符
                </span>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !promptText.trim()}
                  className="btn-interactive flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold"
                  style={{
                    background: isGenerating || !promptText.trim()
                      ? 'var(--theme-btn-bg)'
                      : 'linear-gradient(135deg, var(--color-neon-fuchsia), var(--color-neon-purple))',
                    color: isGenerating || !promptText.trim() ? 'var(--muted-foreground)' : 'white',
                    boxShadow: isGenerating || !promptText.trim() ? 'none' : '0 4px 16px rgba(232,121,249,0.35)',
                    cursor: isGenerating || !promptText.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCwIcon size={14} className="animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <SparklesIcon size={14} />
                      开始生成
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: output */}
          <div className="flex-1">
            <div className="glass-card p-4 h-full" style={{ minHeight: '240px' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-foreground">生成结果</span>
                <div className="flex items-center gap-2">
                  <button
                    className="btn-interactive flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs"
                    style={{ background: 'var(--theme-btn-bg)', color: 'var(--muted-foreground)', border: '1px solid var(--theme-btn-border)' }}
                    onClick={() => { if (generatedOutput) navigator.clipboard?.writeText(generatedOutput); }}
                  >
                    <CopyIcon size={11} />
                    复制
                  </button>
                  <button
                    className="btn-interactive flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs"
                    style={{ background: 'var(--theme-btn-bg)', color: 'var(--muted-foreground)', border: '1px solid var(--theme-btn-border)' }}
                  >
                    <DownloadIcon size={11} />
                    导出
                  </button>
                </div>
              </div>
              <div
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{
                  color: generatedOutput ? 'var(--foreground)' : 'var(--muted-foreground)',
                  minHeight: '160px',
                }}
              >
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(232,121,249,0.15)' }}
                    >
                      <SparklesIcon size={20} style={{ color: 'var(--color-neon-fuchsia)' }} className="animate-pulse" />
                    </div>
                    <span style={{ color: 'var(--muted-foreground)' }}>AI 正在生成内容...</span>
                  </div>
                ) : generatedOutput || `结果将在此处显示。请在左侧输入提示词并点击「开始生成」。`}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default GenerationPage;
