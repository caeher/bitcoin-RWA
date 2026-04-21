import { FormEvent, useState } from 'react';
import {
  CheckCircle2,
  Copy,
  KeyRound,
  RefreshCcw,
  ShieldCheck,
  Trash2,
  UserCircle2,
} from 'lucide-react';
import { Layout } from '@components/specialized';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, SectionHeader, StatTile } from '@components/ui';
import { useAuthApi, useWalletApi } from '@hooks';
import { useNotificationStore } from '@stores';
import { formatDate, formatSats, truncateAddress } from '@lib/utils';
import type { ApiKeyCreateResponse } from '@types';

const apiScopeOptions = [
  'wallet:read',
  'wallet:write',
  'marketplace:read',
  'marketplace:write',
  'tokenization:read',
  'tokenization:write',
  'nostr:write',
];

export function Settings() {
  const authApi = useAuthApi();
  const walletApi = useWalletApi();
  const { success } = useNotificationStore();

  const { data: currentUser } = authApi.getCurrentUser();
  const { data: custody } = walletApi.getCustodyStatus();
  const { data: kyc } = authApi.getKycStatus();
  const { data: onboarding } = authApi.getOnboardingSummary();
  const { data: referral } = authApi.getReferralSummary();
  const { data: apiKeys = [] } = authApi.getApiKeys();

  const { mutateAsync: submitKyc, isPending: isSubmittingKyc } = authApi.submitKyc;
  const { mutateAsync: enableTwoFactor, isPending: isEnablingTwoFactor } = authApi.enableTwoFactor;
  const { mutateAsync: verifyTwoFactor, isPending: isVerifyingTwoFactor } = authApi.verifyTwoFactor;
  const { mutateAsync: createApiKey, isPending: isCreatingApiKey } = authApi.createApiKey;
  const { mutateAsync: revokeApiKey, isPending: isRevokingApiKey } = authApi.revokeApiKey;
  const { mutateAsync: rotateApiKey, isPending: isRotatingApiKey } = authApi.rotateApiKey;

  const [kycDocumentUrl, setKycDocumentUrl] = useState('');
  const [kycNotes, setKycNotes] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [totpSetup, setTotpSetup] = useState<{ totp_uri: string; backup_codes: string[] } | null>(null);
  const [apiKeyName, setApiKeyName] = useState('');
  const [apiKeyExpiry, setApiKeyExpiry] = useState('');
  const [apiKeyScopes, setApiKeyScopes] = useState<string[]>(['wallet:read']);
  const [latestApiKey, setLatestApiKey] = useState<ApiKeyCreateResponse | null>(null);

  const handleKycSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await submitKyc({
      document_url: kycDocumentUrl || undefined,
      notes: kycNotes || undefined,
    });
    success('KYC enviado', 'Tu solicitud fue enviada correctamente.');
    setKycDocumentUrl('');
    setKycNotes('');
  };

  const handleEnableTwoFactor = async () => {
    const response = await enableTwoFactor();
    setTotpSetup(response);
  };

  const handleVerifyTwoFactor = async (event: FormEvent) => {
    event.preventDefault();
    await verifyTwoFactor(totpCode);
    success('2FA habilitado', 'La verificacion TOTP fue confirmada.');
    setTotpCode('');
    setTotpSetup(null);
  };

  const handleScopeToggle = (scope: string) => {
    setApiKeyScopes((current) =>
      current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope]
    );
  };

  const handleCreateApiKey = async (event: FormEvent) => {
    event.preventDefault();

    const response = await createApiKey({
      name: apiKeyName,
      scopes: apiKeyScopes,
      expires_at: apiKeyExpiry ? new Date(apiKeyExpiry).toISOString() : undefined,
    });

    setLatestApiKey(response);
    setApiKeyName('');
    setApiKeyExpiry('');
    setApiKeyScopes(['wallet:read']);
    success('API key creada', 'Guarda el secreto ahora; luego solo veras el prefijo.');
  };

  const handleRotateApiKey = async (keyId: string) => {
    const response = await rotateApiKey(keyId);
    setLatestApiKey(response);
    success('API key rotada', 'Se genero un nuevo secreto para la llave seleccionada.');
  };

  const handleRevokeApiKey = async (keyId: string) => {
    await revokeApiKey(keyId);
    success('API key revocada', 'La llave ya no podra usarse.');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <SectionHeader
          title="Settings"
          description="Configuracion de cuenta, seguridad, API keys y estado operativo del usuario."
        />

        <div className="grid xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle2 size={18} className="text-accent-bitcoin" />
                Cuenta
              </CardTitle>
              <CardDescription>Datos expuestos por `/auth/me` y estado general.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Display name" value={currentUser?.display_name || ''} readOnly />
              <Input label="Email" value={currentUser?.email || ''} readOnly />
              <Input label="Nostr pubkey" value={currentUser?.nostr_pubkey || ''} readOnly copyable />

              <div className="grid grid-cols-2 gap-3">
                <StatTile label="Role" value={<Badge variant="info">{currentUser?.role || 'user'}</Badge>} size="sm" />
                <StatTile
                  label="KYC"
                  value={
                    <Badge variant={kyc?.status === 'verified' ? 'success' : 'warning'}>
                      {kyc?.status || 'none'}
                    </Badge>
                  }
                  size="sm"
                />
              </div>

              <div className="rounded-lg bg-background-elevated p-4 text-sm text-foreground-secondary space-y-2">
                <p>Creado: {currentUser?.created_at ? formatDate(currentUser.created_at, false) : '--'}</p>
                <p>Custodia: {custody?.wallet_backend || '--'}</p>
                <p>2FA en retiros: {custody?.withdraw_requires_2fa ? 'habilitado' : 'pendiente'}</p>
              </div>

              <p className="text-xs text-foreground-secondary">
                El OpenAPI actual no expone un endpoint para editar perfil, por eso estos datos se muestran en modo lectura.
              </p>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Onboarding y compliance</CardTitle>
              <CardDescription>Resumen de KYC, custodia y proveedores fiat disponibles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-3">
                <StatTile
                  label="KYC"
                  value={onboarding?.kyc_status || kyc?.status || 'none'}
                  valueClassName="capitalize"
                />
                <StatTile
                  label="Custody"
                  value={onboarding?.custody_configured ? 'ready' : 'pending'}
                  valueClassName="capitalize"
                />
                <StatTile label="Fiat providers" value={onboarding?.fiat_onramp_providers?.length || 0} />
              </div>

              <form className="space-y-4" onSubmit={handleKycSubmit}>
                <Input
                  label="Documento KYC URL"
                  placeholder="https://example.com/id.pdf"
                  value={kycDocumentUrl}
                  onChange={(event) => setKycDocumentUrl(event.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Notas</label>
                  <textarea
                    value={kycNotes}
                    onChange={(event) => setKycNotes(event.target.value)}
                    rows={4}
                    className="w-full rounded-md border border-border bg-background-elevated px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bitcoin/50"
                    placeholder="Informacion adicional para el equipo de revision"
                  />
                </div>
                <Button type="submit" isLoading={isSubmittingKyc}>
                  Enviar KYC
                </Button>
              </form>

              {!!onboarding?.compliance_notices?.length && (
                <div className="space-y-2">
                  {onboarding.compliance_notices.map((notice: string, index: number) => (
                    <div key={`${notice}-${index}`} className="rounded-lg border border-border bg-background-elevated p-3 text-sm text-foreground-secondary">
                      {notice}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-accent-green" />
                Seguridad y 2FA
              </CardTitle>
              <CardDescription>Configuracion real usando `/auth/2fa/*`.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-background-elevated p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Estado de retiro protegido</p>
                  <p className="text-sm text-foreground-secondary">
                    {custody?.withdraw_requires_2fa
                      ? 'Tu wallet ya exige verificacion TOTP al retirar.'
                      : 'Todavia puedes activar TOTP desde esta pantalla.'}
                  </p>
                </div>
                <Badge variant={custody?.withdraw_requires_2fa ? 'success' : 'warning'}>
                  {custody?.withdraw_requires_2fa ? 'Enabled' : 'Pending'}
                </Badge>
              </div>

              {!custody?.withdraw_requires_2fa && !totpSetup && (
                <Button onClick={handleEnableTwoFactor} isLoading={isEnablingTwoFactor}>
                  Generar setup 2FA
                </Button>
              )}

              {totpSetup && (
                <form className="space-y-4" onSubmit={handleVerifyTwoFactor}>
                  <Input label="TOTP URI" value={totpSetup.totp_uri} readOnly copyable />
                  <div className="rounded-lg bg-background-elevated p-4">
                    <p className="font-medium mb-3">Backup codes</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {totpSetup.backup_codes.map((code) => (
                        <div key={code} className="rounded-md border border-border px-3 py-2 font-mono text-sm">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Input
                    label="Codigo TOTP"
                    value={totpCode}
                    onChange={(event) => setTotpCode(event.target.value)}
                    placeholder="123456"
                    maxLength={6}
                  />
                  <Button type="submit" isLoading={isVerifyingTwoFactor}>
                    Verificar y activar
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Referidos</CardTitle>
              <CardDescription>Resumen directo desde `/auth/referrals/summary`.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-background-elevated p-4">
                  <p className="text-xs text-foreground-secondary mb-1">Referral code</p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">{referral?.referral_code || '--'}</span>
                    {referral?.referral_code && (
                      <button
                        type="button"
                        className="text-foreground-secondary hover:text-foreground"
                        onClick={() => {
                          navigator.clipboard.writeText(referral.referral_code);
                          success('Codigo copiado', 'Tu referral code fue copiado al portapapeles.');
                        }}
                      >
                        <Copy size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="rounded-lg bg-background-elevated p-4">
                  <p className="text-xs text-foreground-secondary mb-1">Total ganado</p>
                  <p className="font-medium">{formatSats(referral?.total_reward_sat || 0)} sats</p>
                </div>
              </div>

              <div className="rounded-lg bg-background-elevated p-4">
                <p className="font-medium mb-2">Usuarios referidos</p>
                <div className="space-y-2">
                  {(referral?.referred_users || []).slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between text-sm">
                      <span>{user.display_name}</span>
                      <span className="text-foreground-secondary">{formatDate(user.created_at, false)}</span>
                    </div>
                  ))}
                  {!referral?.referred_users?.length && (
                    <p className="text-sm text-foreground-secondary">Aun no tienes referidos registrados.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound size={18} className="text-accent-bitcoin" />
                Crear API key
              </CardTitle>
              <CardDescription>Llaves de integracion usando `/auth/api-keys`.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreateApiKey}>
                <Input
                  label="Nombre"
                  value={apiKeyName}
                  onChange={(event) => setApiKeyName(event.target.value)}
                  placeholder="Backoffice bot"
                  required
                />
                <Input
                  label="Expira en"
                  type="datetime-local"
                  value={apiKeyExpiry}
                  onChange={(event) => setApiKeyExpiry(event.target.value)}
                />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Scopes</p>
                  {apiScopeOptions.map((scope) => (
                    <label key={scope} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={apiKeyScopes.includes(scope)}
                        onChange={() => handleScopeToggle(scope)}
                      />
                      <span>{scope}</span>
                    </label>
                  ))}
                </div>
                <Button type="submit" isLoading={isCreatingApiKey} disabled={!apiKeyScopes.length}>
                  Crear key
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>API keys existentes</CardTitle>
              <CardDescription>Lista, rotacion y revocacion.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestApiKey && (
                <div className="rounded-lg border border-accent-green/20 bg-accent-green/10 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-accent-green">
                    <CheckCircle2 size={16} />
                    <span className="font-medium">Secreto visible solo una vez</span>
                  </div>
                  <Input label="API key" value={latestApiKey.key} readOnly copyable />
                  <div className="grid sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-foreground-secondary">Prefijo</p>
                      <p className="font-mono">{latestApiKey.key_prefix}</p>
                    </div>
                    <div>
                      <p className="text-foreground-secondary">Creada</p>
                      <p>{formatDate(latestApiKey.created_at, false)}</p>
                    </div>
                    <div>
                      <p className="text-foreground-secondary">Scopes</p>
                      <p>{latestApiKey.scopes.join(', ')}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="rounded-lg border border-border p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{apiKey.name}</p>
                          <Badge variant={apiKey.revoked ? 'danger' : 'success'}>
                            {apiKey.revoked ? 'Revoked' : 'Active'}
                          </Badge>
                        </div>
                        <p className="font-mono text-sm text-foreground-secondary">{apiKey.key_prefix}</p>
                        <div className="flex flex-wrap gap-2">
                          {apiKey.scopes.map((scope) => (
                            <Badge key={scope} variant="subtle">{scope}</Badge>
                          ))}
                        </div>
                        <div className="text-xs text-foreground-secondary">
                          <p>Creada: {formatDate(apiKey.created_at, false)}</p>
                          <p>Ultimo uso: {apiKey.last_used_at ? formatDate(apiKey.last_used_at, false) : 'Nunca'}</p>
                          <p>Expira: {apiKey.expires_at ? formatDate(apiKey.expires_at, false) : 'Sin expiracion'}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleRotateApiKey(apiKey.id)}
                          isLoading={isRotatingApiKey}
                          disabled={apiKey.revoked}
                          leftIcon={<RefreshCcw size={16} />}
                        >
                          Rotar
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleRevokeApiKey(apiKey.id)}
                          isLoading={isRevokingApiKey}
                          disabled={apiKey.revoked}
                          leftIcon={<Trash2 size={16} />}
                        >
                          Revocar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {!apiKeys.length && (
                  <div className="rounded-lg bg-background-elevated p-6 text-center text-foreground-secondary">
                    No hay API keys creadas todavia.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Estado operativo</CardTitle>
            <CardDescription>Lectura consolidada para wallet y rampa fiat.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="rounded-lg bg-background-elevated p-4">
              <p className="text-xs text-foreground-secondary mb-1">Wallet backend</p>
              <p className="font-medium">{custody?.wallet_backend || '--'}</p>
            </div>
            <div className="rounded-lg bg-background-elevated p-4">
              <p className="text-xs text-foreground-secondary mb-1">Signer backend</p>
              <p className="font-medium">{custody?.signer_backend || '--'}</p>
            </div>
            <div className="rounded-lg bg-background-elevated p-4">
              <p className="text-xs text-foreground-secondary mb-1">Derivation path</p>
              <p className="font-mono text-sm">{truncateAddress(custody?.derivation_path || '--', 10)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
