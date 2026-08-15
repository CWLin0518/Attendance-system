import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Server,
  Globe,
  Wifi,
  Copy,
  Check,
  X,
  ShieldAlert,
  HelpCircle,
  Terminal,
  ExternalLink,
} from 'lucide-react';

interface ServerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ServerInfo {
  hostname: string;
  port: number;
  localIps: string[];
}

export const ServerInfoModal: React.FC<ServerInfoModalProps> = ({ isOpen, onClose }) => {
  const [info, setInfo] = useState<ServerInfo | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/server-info')
        .then((r) => r.json())
        .then((data) => {
          setInfo(data);
        })
        .catch(() => {
          setInfo({
            hostname: window.location.hostname,
            port: parseInt(window.location.port || '3000', 10),
            localIps: [window.location.hostname],
          });
        });
    }
  }, [isOpen]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  if (!isOpen) return null;

  const currentOrigin = window.location.origin;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D3C35]/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl border border-[#EBE9E0] max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="px-6 py-5 border-b border-[#EBE9E0] bg-[#FAF9F5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#6B705C] text-white flex items-center justify-center shadow-md">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#3D3C35] flex items-center gap-2">
                  伺服器與外部連線指南
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                    運行中 (Online)
                  </span>
                </h3>
                <p className="text-xs text-[#A5A295]">讓其他電腦、手機或外網直接連線打卡</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#A5A295] hover:text-[#3D3C35] hover:bg-[#EBE9E0] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#4A4941]">
            {/* Section 1: Local Area Network (Wi-Fi) */}
            <div className="p-4 rounded-2xl bg-[#F7F6F2] border border-[#EBE9E0] space-y-3">
              <div className="flex items-center gap-2 text-[#6B705C] font-bold text-sm">
                <Wifi className="w-4 h-4" />
                <span>方案一：同一區域網路 (辦公室 / 家中 Wi-Fi)</span>
              </div>
              <p className="text-xs text-[#6C6A5E] leading-relaxed">
                只要手機或其它電腦連上與這台主機<strong>相同的 Wi-Fi</strong>，在瀏覽器打開以下網址即可使用：
              </p>

              <div className="space-y-2">
                {info?.localIps && info.localIps.length > 0 ? (
                  info.localIps.map((ip) => {
                    const url = `http://${ip}:${info.port || 3000}`;
                    return (
                      <div
                        key={ip}
                        className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-[#EBE9E0] font-mono text-xs text-[#3D3C35]"
                      >
                        <span className="font-semibold">{url}</span>
                        <button
                          onClick={() => copyToClipboard(url)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F0EEE6] hover:bg-[#6B705C] hover:text-white transition-colors text-xs font-sans"
                        >
                          {copiedText === url ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>已複製</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>複製網址</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-[#EBE9E0] font-mono text-xs">
                    <span>{currentOrigin}</span>
                    <button
                      onClick={() => copyToClipboard(currentOrigin)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F0EEE6] hover:bg-[#6B705C] hover:text-white transition-colors text-xs font-sans"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>複製</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: External Internet / Cloudflare Tunnel */}
            <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#EEDCC9] space-y-3">
              <div className="flex items-center gap-2 text-[#A47148] font-bold text-sm">
                <Globe className="w-4 h-4" />
                <span>方案二：外網遠端連線 (外出 4G/5G 手機)</span>
              </div>
              <p className="text-xs text-[#6C6A5E] leading-relaxed">
                使用免費且免開 Port 的 <strong>Cloudflare Tunnel</strong> 即可安全對外提供 HTTPS 網址：
              </p>

              <div className="p-3 bg-[#3D3C35] text-[#F7F6F2] rounded-xl font-mono text-xs space-y-1 overflow-x-auto">
                <div className="text-[#A5A295]"># 在主機終端機執行一行指令即可生成外網專屬 HTTPS 網址：</div>
                <div className="text-emerald-400 font-bold flex items-center justify-between gap-2">
                  <span>npx cloudflared tunnel --url http://localhost:{info?.port || 3000}</span>
                  <button
                    onClick={() =>
                      copyToClipboard(`npx cloudflared tunnel --url http://localhost:${info?.port || 3000}`)
                    }
                    className="text-xs bg-[#525046] hover:bg-emerald-600 px-2 py-0.5 rounded text-white font-sans shrink-0"
                  >
                    {copiedText?.includes('cloudflared') ? '已複製' : '複製指令'}
                  </button>
                </div>
              </div>
            </div>

            {/* Section 3: Firewall Notice */}
            <div className="p-4 rounded-2xl bg-white border border-[#EBE9E0] space-y-2">
              <div className="flex items-center gap-2 text-[#3D3C35] font-semibold text-xs">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>區網連不上時的排除步驟 (Windows 防火牆放行)</span>
              </div>
              <p className="text-[11px] text-[#8C887B] leading-relaxed">
                若手機連同一個 Wi-Fi 仍無法載入網頁，通常是 Windows 防火牆阻擋。可以以系統管理員身分開啟 PowerShell 執行：
              </p>
              <div className="p-2.5 bg-[#FAF9F5] rounded-xl border border-[#EBE9E0] font-mono text-[11px] text-[#4A4941] flex items-center justify-between">
                <span className="truncate mr-2">
                  New-NetFirewallRule -DisplayName "Attendance Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      'New-NetFirewallRule -DisplayName "Attendance Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow'
                    )
                  }
                  className="shrink-0 text-xs px-2 py-1 bg-[#EBE9E0] hover:bg-[#6B705C] hover:text-white rounded"
                >
                  複製
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-[#EBE9E0] bg-[#FAF9F5] flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#6B705C] hover:bg-[#585C4B] text-white text-xs font-semibold shadow-sm transition-colors"
            >
              知道了，關閉
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
