import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, AlertCircle, Eye, EyeOff, Globe, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { useI18n } from "@/hooks/use-i18n";

export const Route = createFileRoute("/src/routes/login")({
  beforeLoad: async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Login — Intranet" },
      { name: "description", content: "Acesso ao portal corporativo." },
    ],
  }),
});

function LoginPage() {
  const { login, signup } = useAuth();
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  // beforeLoad already redirects authenticated users

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignup) {
        await signup(email, password, name);
      } else {
        await login(email, password);
      }
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err.message || t("login.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side — branding */}
      <div className="hidden flex-1 flex-col justify-between bg-primary p-10 lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/10">
              <span className="text-xl font-bold text-primary-foreground">IN</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">Intranet</h1>
              <p className="text-xs text-primary-foreground/60">{t("header.subtitle")}</p>
            </div>
          </div>
        </div>
        <div className="max-w-md">
          <h2 className="text-3xl font-bold leading-tight text-primary-foreground">
            {t("login.heroTitle")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-primary-foreground/60">
            {t("login.heroDesc")}
          </p>
        </div>
        <p className="text-xs text-primary-foreground/40">{t("footer.text")} — © {new Date().getFullYear()}</p>
      </div>

      {/* Right side — form */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 lg:max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-6"
        >
          {/* Mobile logo */}
          <div className="flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">IN</span>
              </div>
              <span className="font-bold text-foreground">Intranet</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setLang(lang === "pt" ? "en" : "pt")}>
              <Globe className="mr-1 h-4 w-4" />
              {lang === "pt" ? "EN 🇬🇧" : "PT 🇧🇷"}
            </Button>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {isSignup ? (lang === "pt" ? "Criar Conta" : "Create Account") : t("login.title")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isSignup ? (lang === "pt" ? "Preencha os dados para se cadastrar" : "Fill in to sign up") : t("login.subtitle")}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name">{lang === "pt" ? "Nome completo" : "Full name"}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="João Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t("login.email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("login.password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "..." : isSignup ? (lang === "pt" ? "Cadastrar" : "Sign Up") : t("login.submit")}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => { setIsSignup(!isSignup); setError(""); }}
            >
              {isSignup
                ? (lang === "pt" ? "Já tem conta? Faça login" : "Already have an account? Sign in")
                : (lang === "pt" ? "Não tem conta? Cadastre-se" : "No account? Sign up")}
            </button>
          </div>

          {/* Language toggle (desktop) */}
          <div className="hidden justify-center lg:flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === "pt" ? "en" : "pt")}
              className="text-xs text-muted-foreground"
            >
              <Globe className="mr-1.5 h-3.5 w-3.5" />
              {lang === "pt" ? "Switch to English 🇬🇧" : "Mudar para Português 🇧🇷"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
