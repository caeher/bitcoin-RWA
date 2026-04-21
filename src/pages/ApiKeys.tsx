import { FormEvent, useState } from 'react';
import {
  CheckCircle2,
  KeyRound,
  RefreshCcw,
  Trash2,
} from 'lucide-react';
import { Layout } from '@components/specialized';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  SectionHeader,
} from '@components/ui';
import { useAuthApi } from '@hooks';
import { useNotificationStore } from '@stores';
import { formatDate } from '@lib/utils';
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

export function ApiKeys() {
  const authApi = useAuthApi();
  const { success } = useNotificationStore();

  const { data: apiKeys = [] } = authApi.getApiKeys();
  const { mutateAsync: createApiKey, isPending: isCreatingApiKey } = authApi.createApiKey;
  const { mutateAsync: revokeApiKey, isPending: isRevokingApiKey } = authApi.revokeApiKey;
  const { mutateAsync: rotateApiKey, isPending: isRotatingApiKey } = authApi.rotateApiKey;

  const [apiKeyName, setApiKeyName] = useState('');
  const [apiKeyExpiry, setApiKeyExpiry] = useState('');
  const [apiKeyScopes, setApiKeyScopes] = useState<string[]>(['wallet:read']);
  const [latestApiKey, setLatestApiKey] = useState<ApiKeyCreateResponse | null>(null);

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
          title="API Keys"
          description="Crea, rota y revoca llaves de integracion desde una pagina dedicada."
        />

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
      </div>
    </Layout>
  );
}
