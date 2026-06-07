import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeftIcon, ZapIcon } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-full items-center justify-center" style={{ background: 'var(--background)' }}>
      <div className="text-center">
        <div className="text-8xl font-black gradient-text mb-4">404</div>
        <p className="text-lg font-medium text-foreground mb-2">页面未找到</p>
        <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>
          您访问的页面不存在或已被移除
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="liquid-btn inline-flex items-center gap-2 px-6 py-2.5 text-sm"
        >
          <ArrowLeftIcon size={14} />
          返回仪表盘
        </button>
      </div>
    </div>
  );
};

export default NotFound;
