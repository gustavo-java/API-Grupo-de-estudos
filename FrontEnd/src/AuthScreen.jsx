import { useState } from "react";
import {
  ArrowRight,
  Box,
  Check,
  Eye,
  EyeOff,
  Layers3,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { api, setToken } from "./api";

export function Brand({ light = false }) {
  return (
    <div className={`brand ${light ? "brand-light" : ""}`}>
      <span className="brand-mark">
        <Layers3 size={25} strokeWidth={2.5} />
      </span>
      <span>
        nexo<span className="brand-dot">.</span>
      </span>
    </div>
  );
}

export default function AuthScreen({ onLogin, notice }) {
  const [register, setRegister] = useState(false);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (register && values.password !== values.confirm)
      return setError("As senhas precisam ser iguais.");
    delete values.confirm;
    setBusy(true);
    setError("");
    try {
      const session = await api(`/auth/${register ? "register" : "login"}`, {
        method: "POST",
        body: values,
      });
      setToken(session.accessToken);
      onLogin(session.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-page">
      <section className="auth-story">
        <Brand light />
        <div className="story-copy">
          <span className="eyebrow light">
            <span className="tiny-dot" /> SEU CATÁLOGO, CONECTADO
          </span>
          <h1>
            Menos planilhas.
            <br />
            Mais possibilidades<span>.</span>
          </h1>
          <p>
            Produtos, estoque e imagens.
            <br />
            Tudo organizado em um só lugar.
          </p>
        </div>
        <div className="catalog-art" aria-hidden="true">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-panel">
            <div className="art-panel-top">
              <span className="art-icon">
                <Box size={22} />
              </span>
              <span>
                Seu catálogo
                <br />
                <small>Sempre em dia</small>
              </span>
              <span className="art-dots">•••</span>
            </div>
            <div className="art-product">
              <div className="medicine-box">
                <span>nexo</span>
                <div className="medicine-cross">+</div>
                <small>CUIDADO EM CADA DETALHE</small>
              </div>
              <div className="medicine-bottle">
                <div />
                <span>
                  nexo
                  <br />
                  <b>+</b>
                </span>
              </div>
            </div>
            <div className="art-row">
              <span>
                <i /> Produtos organizados
              </span>
              <Check size={16} />
            </div>
            <div className="art-row">
              <span>
                <i /> Estoque sob controle
              </span>
              <Check size={16} />
            </div>
          </div>
          <div className="art-float">
            <span>
              <Check size={18} />
            </span>
            <div>
              Tudo conectado<small>Da sua API ao seu negócio</small>
            </div>
          </div>
        </div>
        <div className="story-footer">
          <ShieldCheck size={17} /> Gestão simples. Acesso seguro.
        </div>
      </section>
      <section className="auth-form-side">
        <div className="auth-top">
          <span>PORTAL DE GESTÃO</span>
          <span className="subtle-chip">Nexo / 01</span>
        </div>
        <div className="auth-form-wrap">
          <div className="welcome-icon">
            <Sparkles size={24} />
          </div>
          <span className="eyebrow">COMECE POR AQUI</span>
          <h2>{register ? "Seu próximo passo." : "Bom ter você por aqui."}</h2>
          <p className="muted">
            {register
              ? "Crie sua conta e dê mais organização à sua rotina."
              : "Entre na sua conta para cuidar do que importa."}
          </p>
          <div className="auth-tabs">
            <button
              type="button"
              className={!register ? "selected" : ""}
              onClick={() => {
                setRegister(false);
                setError("");
              }}
            >
              Entrar
            </button>
            <button
              type="button"
              className={register ? "selected" : ""}
              onClick={() => {
                setRegister(true);
                setError("");
              }}
            >
              Criar conta
            </button>
          </div>
          {notice && (
            <div className="notice" role="status">
              {notice}
            </div>
          )}
          <form onSubmit={submit} key={register ? "register" : "login"}>
            {register && (
              <label>
                Nome completo
                <input
                  name="name"
                  autoComplete="name"
                  placeholder="Como podemos chamar você?"
                  required
                  maxLength={100}
                  pattern=".*\S.*"
                />
              </label>
            )}
            <label>
              E-mail
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="voce@empresa.com.br"
                maxLength={254}
                required
              />
            </label>
            <label>
              Senha
              <div className="password-field">
                <input
                  type={visible ? "text" : "password"}
                  name="password"
                  autoComplete={register ? "new-password" : "current-password"}
                  placeholder={
                    register
                      ? "Crie uma senha com 6 ou mais caracteres"
                      : "Digite sua senha"
                  }
                  minLength={6}
                  maxLength={128}
                  required
                />
                <button
                  type="button"
                  onClick={() => setVisible(!visible)}
                  aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            {register && (
              <label>
                Confirmar senha
                <input
                  type={visible ? "text" : "password"}
                  name="confirm"
                  autoComplete="new-password"
                  placeholder="Digite a senha novamente"
                  required
                  minLength={6}
                  maxLength={128}
                />
              </label>
            )}
            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}
            <button className="button primary auth-submit" disabled={busy}>
              {busy ? (
                <>
                  <span className="spinner" /> Aguarde…
                </>
              ) : (
                <>
                  {register ? "Criar minha conta" : "Acessar portal"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
          <div className="auth-note">
            <ShieldCheck size={19} />
            <p>
              {register
                ? "A primeira conta cadastrada recebe acesso de administrador. As demais podem consultar o catálogo."
                : "Seu espaço para uma gestão mais simples, organizada e conectada."}
            </p>
          </div>
        </div>
        <footer className="auth-footer">
          <span>
            © {new Date().getFullYear()} Nexo. Feito para simplificar.
          </span>
          <span>
            <LockKeyhole size={13} /> Acesso autenticado
          </span>
        </footer>
      </section>
    </main>
  );
}
