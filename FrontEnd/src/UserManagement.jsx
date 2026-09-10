import { useEffect, useState } from "react";
import { Edit3, Plus, RefreshCw, Search, Trash2, Users } from "lucide-react";
import { api } from "./api";
import { Modal } from "./ProductForm";
export const roleLabels = {
  Admin: "Admin",
  Farmacia: "Farmácia",
  Usuario: "Cliente",
};

export default function UserManagement({ currentUser, onCurrentUserChanged }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");
  async function load() {
    setLoading(true);
    setError("");
    try {
      setUsers(await api("/users"));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setActionError("");
    const body = Object.fromEntries(new FormData(event.currentTarget));
    body.name = body.name.trim();
    body.email = body.email.trim();
    if (!body.password) delete body.password;
    try {
      const result = await api(`/users${editing.id ? `/${editing.id}` : ""}`, {
        method: editing.id ? "PATCH" : "POST",
        body,
      });
      setUsers((old) =>
        editing.id
          ? old.map((u) => (u.id === result.id ? result : u))
          : [...old, result],
      );
      setEditing(null);
      setMessage("Usuário salvo. As permissões já estão em vigor.");
      if (result.id === currentUser.sub) await onCurrentUserChanged();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    setBusy(true);
    setActionError("");
    try {
      await api(`/users/${deleting.id}`, { method: "DELETE" });
      setUsers((old) => old.filter((u) => u.id !== deleting.id));
      setDeleting(null);
      setMessage("Usuário excluído. As sessões dessa conta foram revogadas.");
      if (deleting.id === currentUser.sub) await onCurrentUserChanged();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const filtered = users.filter((u) =>
    `${u.name} ${u.email} ${roleLabels[u.roles]}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <section className="catalog user-management">
      <div className="catalog-heading">
        <div>
          <h2>
            <Users size={20} /> Equipe e clientes <span>{users.length}</span>
          </h2>
          <p>
            Defina quem pode administrar, gerenciar produtos ou consultar o
            catálogo.
          </p>
        </div>
        <div className="heading-actions">
          <button
            className="icon-button"
            aria-label="Atualizar usuários"
            disabled={loading}
            onClick={load}
          >
            <RefreshCw size={18} />
          </button>
          <button
            className="button primary"
            onClick={() => {
              setEditing({});
              setActionError("");
            }}
          >
            <Plus size={17} /> Novo usuário
          </button>
        </div>
      </div>
      <div className="catalog-toolbar">
        <div className="search-field">
          <Search size={18} />
          <input
            aria-label="Buscar usuários"
            placeholder="Nome, e-mail ou função…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      {message && (
        <div className="notice management-notice" role="status">
          {message}
        </div>
      )}
      {error && (
        <div className="error-message management-notice" role="alert">
          {error}
        </div>
      )}
      {loading ? (
        <p className="management-notice" role="status">
          Carregando usuários…
        </p>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>E-mail</th>
                <th>Função</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.name}</strong>
                    {u.id === currentUser.sub && <small> (você)</small>}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span
                      className={`badge ${u.roles === "Admin" ? "in-stock" : "low-stock"}`}
                    >
                      {roleLabels[u.roles]}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="icon-button"
                        aria-label={`Editar usuário ${u.name}`}
                        onClick={() => {
                          setEditing(u);
                          setActionError("");
                        }}
                      >
                        <Edit3 size={17} />
                      </button>
                      <button
                        className="icon-button danger-text"
                        aria-label={`Excluir usuário ${u.name}`}
                        onClick={() => {
                          setDeleting(u);
                          setActionError("");
                        }}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <p className="management-notice">Nenhum usuário encontrado.</p>
          )}
        </div>
      )}
      <div className="notice management-notice">
        Admin: usuários, funções e produtos. Farmácia: gerenciamento de
        produtos. Cliente: consulta de produtos. O último Admin não pode ser
        excluído nem perder sua função.
      </div>
      {editing && (
        <Modal
          title={editing.id ? "Editar usuário" : "Novo usuário"}
          subtitle="As mudanças de função valem nas próximas requisições."
          onClose={() => setEditing(null)}
          busy={busy}
        >
          <form onSubmit={save}>
            <div className="modal-content">
              <fieldset className="plain-fieldset" disabled={busy}>
                <label>
                  Nome
                  <input
                    name="name"
                    defaultValue={editing.name}
                    maxLength={100}
                    required
                  />
                </label>
                <label>
                  E-mail
                  <input
                    name="email"
                    type="email"
                    defaultValue={editing.email}
                    maxLength={254}
                    required
                  />
                </label>
                <label>
                  Função
                  <select
                    className="form-select"
                    name="roles"
                    defaultValue={editing.roles || "Usuario"}
                  >
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {editing.id ? "Nova senha (opcional)" : "Senha inicial"}
                  <input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={6}
                    maxLength={128}
                    required={!editing.id}
                    placeholder={
                      editing.id
                        ? "Deixe em branco para manter a senha"
                        : "Mínimo de 6 caracteres"
                    }
                  />
                </label>
              </fieldset>
              {actionError && (
                <div className="error-message" role="alert">
                  {actionError}
                </div>
              )}
            </div>
            <footer className="modal-footer">
              <button
                className="button secondary"
                type="button"
                onClick={() => setEditing(null)}
                disabled={busy}
              >
                Cancelar
              </button>
              <button className="button primary" disabled={busy}>
                {busy ? "Salvando…" : "Salvar usuário"}
              </button>
            </footer>
          </form>
        </Modal>
      )}
      {deleting && (
        <Modal
          title="Excluir usuário?"
          onClose={() => setDeleting(null)}
          busy={busy}
        >
          <div className="modal-content">
            <p>
              Excluir <strong>{deleting.name}</strong> revoga o acesso dessa
              conta. Esta ação não pode ser desfeita.
            </p>
            {actionError && (
              <div className="error-message" role="alert">
                {actionError}
              </div>
            )}
          </div>
          <footer className="modal-footer">
            <button
              className="button secondary"
              onClick={() => setDeleting(null)}
              disabled={busy}
            >
              Cancelar
            </button>
            <button className="button danger" onClick={remove} disabled={busy}>
              {busy ? "Excluindo…" : "Confirmar exclusão"}
            </button>
          </footer>
        </Modal>
      )}
    </section>
  );
}
