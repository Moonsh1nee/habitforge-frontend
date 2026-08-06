// OAuth2 consent screen ("Wisely/Fuel wants access to your GetGrip account").
// Deliberately a plain server-rendered <form method="POST"> with no client
// JS: the target (POST /oauth/authorize/decision) responds with a redirect
// that must reach the third-party app's redirect_uri as a real top-level
// browser navigation, so a fetch/axios-based submit would be the wrong tool
// here (see src/oauth/router.py's comment on that endpoint for why).

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function decodeJwtPayloadUnverified(token: string): Record<string, unknown> | null {
  // Display-only — never trust this for anything security-relevant. The
  // actual ticket signature is verified server-side when the form is
  // submitted; this is purely so the consent screen can show which app
  // is asking and for what, without an extra round-trip.
  try {
    const [, payloadB64] = token.split(".");
    if (!payloadB64) return null;
    const json = Buffer.from(payloadB64, "base64url").toString("utf-8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

const SCOPE_LABELS: Record<string, string> = {
  openid: "Идентификатор аккаунта",
  profile: "Имя и аватар",
  email: "Email",
};

export default async function OAuthConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ ticket?: string }>;
}) {
  const { ticket } = await searchParams;

  if (!ticket) {
    return (
      <div className="glass p-8 text-center">
        <p className="text-danger text-sm">
          Отсутствует параметр запроса. Начните вход заново из приложения.
        </p>
      </div>
    );
  }

  const payload = decodeJwtPayloadUnverified(ticket);
  const clientId = typeof payload?.client_id === "string" ? payload.client_id : null;
  const scope = typeof payload?.scope === "string" ? payload.scope : "";
  const displayName = clientId
    ? clientId.charAt(0).toUpperCase() + clientId.slice(1)
    : "Приложение";
  const scopeItems = scope
    .split(" ")
    .filter(Boolean)
    .map((s) => SCOPE_LABELS[s] ?? s);

  return (
    <div className="glass p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">{displayName}</h1>
        <p className="text-muted text-sm">хочет получить доступ к вашему аккаунту GetGrip</p>
      </div>

      {scopeItems.length > 0 && (
        <ul className="mb-6 space-y-1.5 text-sm text-text">
          {scopeItems.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="text-success">✓</span> {item}
            </li>
          ))}
        </ul>
      )}

      <form
        method="POST"
        action={`${API_URL}/oauth/authorize/decision`}
        className="flex flex-col gap-2"
      >
        <input type="hidden" name="ticket" value={ticket} />
        <button
          type="submit"
          name="approve"
          value="true"
          className="w-full rounded-lg bg-primary text-white font-semibold py-2.5 hover:opacity-90 transition-opacity"
        >
          Разрешить
        </button>
        <button
          type="submit"
          name="approve"
          value="false"
          className="w-full rounded-lg border border-border py-2.5 text-muted hover:text-text transition-colors"
        >
          Отклонить
        </button>
      </form>
    </div>
  );
}
