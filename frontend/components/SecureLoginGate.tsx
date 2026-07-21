import React, { useState } from "react";
import { Shield, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { ClubXOLogo } from "./ClubXOLogo";

interface SecureLoginGateProps {
  role: "admin" | "employee" | "photographer" | "floor-manager";
  onSuccess: () => void;
}

export const SecureLoginGate: React.FC<SecureLoginGateProps> = ({ role, onSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError(null);

    // Simulate mainframe secure handshake
    setTimeout(() => {
      const lowerUser = username.trim().toLowerCase();
      const rawPass = password;

      if (role === "admin") {
        if (lowerUser === "admin" && rawPass === "xoclubadmin") {
          sessionStorage.setItem("xo_admin_auth", "true");
          onSuccess();
        } else {
          setError("SECURITY CRITICAL: INVALID CORE ADMINISTRATIVE CREDENTIALS");
          setLoading(false);
        }
      } else if (role === "photographer") {
        if (lowerUser === "photographer" && rawPass === "xoclubphoto") {
          sessionStorage.setItem("xo_photographer_auth", "true");
          onSuccess();
        } else {
          setError("SECURITY CRITICAL: INVALID PHOTOGRAPHER PORTAL PASSKEY");
          setLoading(false);
        }
      } else if (role === "floor-manager") {
        if ((lowerUser === "manager" || lowerUser === "floormanager") && rawPass === "xoclubmanager") {
          sessionStorage.setItem("xo_floor_manager_auth", "true");
          onSuccess();
        } else {
          setError("SECURITY CRITICAL: INVALID FLOOR MANAGER PASSKEY");
          setLoading(false);
        }
      } else {
        if ((lowerUser === "employee" || lowerUser === "staff") && rawPass === "xoclubstaff") {
          sessionStorage.setItem("xo_employee_auth", "true");
          onSuccess();
        } else {
          setError("SECURITY CRITICAL: INVALID FLOOR STAFF PORTAL PASSKEY");
          setLoading(false);
        }
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      
      {/* Background ambient grids and glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-[#EF4444]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 opacity-15 club-grid pointer-events-none" />

      <div className="w-full max-w-md bg-black border border-neutral-900 rounded p-8 relative shadow-[0_0_50px_rgba(239,68,68,0.02)]">
        
        {/* Glowing red top accent bar */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-[#EF4444]" />

        {/* Brand Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4 select-none">
            <ClubXOLogo className="w-10 h-10" color="#FFFFFF" glow={false} />
            <div className="flex items-center gap-2 select-none whitespace-nowrap">
              <span className="font-syne font-black text-lg tracking-[0.14em] text-white">
                XO <span className="text-[#EF4444] font-black drop-shadow-[0_0_8px_#EF4444]">CLUB</span>
              </span>
              <span className="text-white/20 text-xs font-mono">/</span>
              <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-slate-450">
                KATHMANDU
              </span>
            </div>
          </div>
          
          <h2 className="font-syne font-black text-sm tracking-widest text-zinc-400 uppercase">
            {role === "admin" ? "MAINFRAME SECURITY PORTAL" : role === "photographer" ? "PHOTOGRAPHER DRIVE CONSOLE" : role === "floor-manager" ? "FLOOR MANAGER COMMAND" : "FLOOR STAFF CONSOLE LOGIN"}
          </h2>
          <span className="font-mono text-[8px] text-[#EF4444] tracking-widest uppercase block mt-1 font-bold">
            {role === "admin" ? "AUTHORIZATION GATE // ADMIN CORES" : role === "photographer" ? "ACCESS GATE // GOOGLE DRIVE PANEL" : role === "floor-manager" ? "SECTOR SEAT COMMAND SYSTEM" : "ACCESS CONSOLE // CHECK-IN TERMINAL"}
          </span>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 p-3 bg-red-950/20 border border-red-900/30 text-red-500 rounded-sm font-mono text-[10px] uppercase text-left leading-normal flex items-start gap-2">
            <Shield size={14} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-5 font-mono text-xs text-left">
          <div>
            <label className="text-[9px] text-zinc-500 block uppercase mb-1 font-bold">PORTAL USERNAME</label>
            <input
              type="text"
              required
              disabled={loading}
              placeholder={role === "admin" ? "admin" : role === "photographer" ? "photographer" : role === "floor-manager" ? "manager" : "employee"}
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-white focus:outline-none focus:border-[#EF4444] transition-all text-xs"
            />
          </div>

          <div>
            <label className="text-[9px] text-zinc-500 block uppercase mb-1 font-bold">PORTAL PASSWORD</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                disabled={loading}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-850 p-3 pr-10 rounded text-white focus:outline-none focus:border-[#EF4444] transition-all text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-white hover:bg-[#EF4444] hover:text-white disabled:bg-neutral-850 disabled:text-zinc-650 text-black font-extrabold tracking-widest uppercase rounded-sm cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                ESTABLISHING SECURE HANDSHAKE...
              </>
            ) : (
              "EXECUTE PORTAL ACCESS"
            )}
          </button>
        </form>

        {/* Back link */}
        <div className="mt-6 pt-4 border-t border-neutral-900 flex justify-between items-center text-[9px] font-mono uppercase text-zinc-600">
          <button
            onClick={() => window.location.href = "/"}
            className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ArrowLeft size={10} />
            BACK TO LOBBY
          </button>
          <span>RE-2026 // SECURE MATRIX</span>
        </div>
      </div>
    </div>
  );
};
