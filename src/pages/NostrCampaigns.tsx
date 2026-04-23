import { FormEvent, useState } from 'react';
import { Megaphone, PauseCircle, PlayCircle, Plus, Trash2, Wallet2, XCircle } from 'lucide-react';
import { Layout } from '@components/specialized';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  SectionHeader,
  StatTile,
} from '@components/ui';
import { useNostrApi } from '@hooks';
import { formatDate, formatSats, truncateAddress } from '@lib/utils';
import { useNotificationStore } from '@stores';
import type { CampaignCreateRequest, CampaignFundingOut, CampaignOut, CampaignTriggerIn } from '@types';

const emptyTrigger = (): CampaignTriggerIn => ({
  trigger_type: 'hashtag',
  operator: 'equals',
  value: '',
  case_sensitive: false,
});

const statusVariant = (status: CampaignOut['status']) => {
  switch (status) {
    case 'active':
    case 'completed':
      return 'success';
    case 'paused':
    case 'cancelled':
    case 'failed':
      return 'danger';
    case 'funding_pending':
    case 'draft':
      return 'warning';
    default:
      return 'secondary';
  }
};

export function NostrCampaigns() {
  const nostrApi = useNostrApi();
  const { success, error: showError } = useNotificationStore();
  const { data: campaigns = [], isLoading } = nostrApi.getCampaigns();

  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);
  const { data: selectedCampaign } = nostrApi.getCampaign(expandedCampaignId || '');
  const { data: matches = [] } = nostrApi.getCampaignMatches(expandedCampaignId || '');
  const { data: payouts = [] } = nostrApi.getCampaignPayouts(expandedCampaignId || '');

  const { mutateAsync: createCampaign, isPending: isCreatingCampaign } = nostrApi.createCampaign;
  const { mutateAsync: fundIntraledger, isPending: isFundingIntraledger } = nostrApi.fundCampaignIntraledger;
  const { mutateAsync: fundExternal, isPending: isFundingExternal } = nostrApi.fundCampaignExternal;
  const { mutateAsync: activateCampaign, isPending: isActivatingCampaign } = nostrApi.activateCampaign;
  const { mutateAsync: pauseCampaign, isPending: isPausingCampaign } = nostrApi.pauseCampaign;
  const { mutateAsync: cancelCampaign, isPending: isCancellingCampaign } = nostrApi.cancelCampaign;

  const [name, setName] = useState('');
  const [fundingMode, setFundingMode] = useState<'intraledger' | 'external'>('intraledger');
  const [rewardAmount, setRewardAmount] = useState('1000');
  const [budgetTotal, setBudgetTotal] = useState('10000');
  const [maxRewardsPerUser, setMaxRewardsPerUser] = useState('1');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [triggers, setTriggers] = useState<CampaignTriggerIn[]>([emptyTrigger()]);
  const [fundingAmounts, setFundingAmounts] = useState<Record<string, string>>({});
  const [latestExternalFunding, setLatestExternalFunding] = useState<{ campaignId: string; funding: CampaignFundingOut } | null>(null);

  const handleTriggerChange = (index: number, field: keyof CampaignTriggerIn, value: string | boolean) => {
    setTriggers((current) =>
      current.map((trigger, triggerIndex) =>
        triggerIndex === index ? { ...trigger, [field]: value } : trigger
      )
    );
  };

  const handleCreateCampaign = async (event: FormEvent) => {
    event.preventDefault();

    const payload: CampaignCreateRequest = {
      name,
      funding_mode: fundingMode,
      reward_amount_sat: Math.max(1, Number(rewardAmount) || 0),
      budget_total_sat: Math.max(1, Number(budgetTotal) || 0),
      max_rewards_per_user: Math.max(1, Number(maxRewardsPerUser) || 1),
      start_at: startAt ? new Date(startAt).toISOString() : undefined,
      end_at: endAt ? new Date(endAt).toISOString() : undefined,
      triggers: triggers.filter((trigger) => trigger.value.trim().length > 0),
    };

    await createCampaign(payload);
    success('Campaña creada', 'La campaña Nostr fue creada correctamente.');
    setName('');
    setRewardAmount('1000');
    setBudgetTotal('10000');
    setMaxRewardsPerUser('1');
    setStartAt('');
    setEndAt('');
    setFundingMode('intraledger');
    setTriggers([emptyTrigger()]);
  };

  const handleFundCampaign = async (campaign: CampaignOut) => {
    try {
      const amount = Math.max(
        1,
        Number(
          fundingAmounts[campaign.id] ||
            campaign.budget_total_sat - campaign.budget_reserved_sat - campaign.budget_spent_sat
        ) || 0
      );

      if (campaign.funding_mode === 'intraledger') {
        await fundIntraledger({ campaignId: campaign.id, amount_sat: amount });
        success('Fondos reservados', 'La campaña quedo financiada con saldo interno.');
        return;
      }

      const response = await fundExternal({ campaignId: campaign.id, amount_sat: amount });
      setLatestExternalFunding({ campaignId: campaign.id, funding: response });
      success('Invoice generada', 'La campaña ahora tiene una invoice externa para funding.');
    } catch (error: any) {
      showError('Error al financiar', error.message || 'No se pudo procesar el financiamiento.');
    }
  };

  const handleCreateCampaignWithHandler = async (event: FormEvent) => {
    try {
      await handleCreateCampaign(event);
    } catch (error: any) {
      showError('Error al crear campaña', error.message || 'No se pudo crear la campaña.');
    }
  };

  const handleActivateCampaign = async (id: string) => {
    try {
      await activateCampaign(id);
      success('Campaña activada', 'La campaña ahora está escuchando eventos en Nostr.');
    } catch (error: any) {
      showError('Error al activar', error.message || 'No se pudo activar la campaña.');
    }
  };

  const handlePauseCampaign = async (id: string) => {
    try {
      await pauseCampaign(id);
      success('Campaña pausada', 'Se detuvo temporalmente la detección de eventos.');
    } catch (error: any) {
      showError('Error al pausar', error.message || 'No se pudo pausar la campaña.');
    }
  };

  const handleCancelCampaign = async (id: string) => {
    try {
      await cancelCampaign(id);
      success('Campaña cancelada', 'La campaña ha sido finalizada.');
    } catch (error: any) {
      showError('Error al cancelar', error.message || 'No se pudo cancelar la campaña.');
    }
  };

  const renderCampaignActions = (campaign: CampaignOut) => (
    <div className="flex flex-wrap gap-2">
      {(campaign.status === 'draft' || campaign.status === 'funding_pending') && (
        <>
          <Input
            className="w-40"
            type="number"
            value={
              fundingAmounts[campaign.id] ??
              String(Math.max(1, campaign.budget_total_sat - campaign.budget_reserved_sat - campaign.budget_spent_sat))
            }
            onChange={(event) =>
              setFundingAmounts((current) => ({ ...current, [campaign.id]: event.target.value }))
            }
          />
          <Button
            variant="outline"
            onClick={() => handleFundCampaign(campaign)}
            isLoading={isFundingIntraledger || isFundingExternal}
            leftIcon={<Wallet2 size={16} />}
          >
            Financiar
          </Button>
        </>
      )}

      {campaign.status === 'funding_pending' && (
        <Button
          onClick={() => handleActivateCampaign(campaign.id)}
          isLoading={isActivatingCampaign}
          leftIcon={<PlayCircle size={16} />}
        >
          Activar
        </Button>
      )}

      {campaign.status === 'active' && (
        <Button
          variant="outline"
          onClick={() => handlePauseCampaign(campaign.id)}
          isLoading={isPausingCampaign}
          leftIcon={<PauseCircle size={16} />}
        >
          Pausar
        </Button>
      )}

      {(campaign.status === 'draft' || campaign.status === 'funding_pending' || campaign.status === 'paused') && (
        <Button
          variant="danger"
          onClick={() => handleCancelCampaign(campaign.id)}
          isLoading={isCancellingCampaign}
          leftIcon={<XCircle size={16} />}
        >
          Cancelar
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <SectionHeader
          title="Nostr Campaigns"
          description="Creacion, funding y seguimiento de campañas conectadas al servicio nostr."
        />

        <div className="grid xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone size={18} className="text-accent-bitcoin" />
                Nueva campaña
              </CardTitle>
              <CardDescription>POST `/v1/nostr/campaigns`.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreateCampaignWithHandler}>
                <Input
                  label="Nombre"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Reward for #bitcoinbuilders"
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Funding mode</label>
                    <select
                      value={fundingMode}
                      onChange={(event) => setFundingMode(event.target.value as 'intraledger' | 'external')}
                      className="w-full rounded-md border border-border bg-background-elevated px-3 py-2 text-sm text-foreground"
                    >
                      <option value="intraledger">intraledger</option>
                      <option value="external">external</option>
                    </select>
                  </div>
                  <Input
                    label="Max per user"
                    type="number"
                    min="1"
                    value={maxRewardsPerUser}
                    onChange={(event) => setMaxRewardsPerUser(event.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Reward (sats)"
                    type="number"
                    min="1"
                    value={rewardAmount}
                    onChange={(event) => setRewardAmount(event.target.value)}
                    required
                  />
                  <Input
                    label="Budget total (sats)"
                    type="number"
                    min="1"
                    value={budgetTotal}
                    onChange={(event) => setBudgetTotal(event.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Inicio"
                    type="datetime-local"
                    value={startAt}
                    onChange={(event) => setStartAt(event.target.value)}
                  />
                  <Input
                    label="Fin"
                    type="datetime-local"
                    value={endAt}
                    onChange={(event) => setEndAt(event.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">Triggers</p>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setTriggers((current) => [...current, emptyTrigger()])}>
                      <Plus size={14} className="mr-1" />
                      Add trigger
                    </Button>
                  </div>

                  {triggers.map((trigger, index) => (
                    <div key={`trigger-${index}`} className="rounded-lg border border-border p-3 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-foreground-secondary mb-1">Trigger type</label>
                          <select
                            value={trigger.trigger_type}
                            onChange={(event) => handleTriggerChange(index, 'trigger_type', event.target.value)}
                            className="w-full rounded-md border border-border bg-background-elevated px-3 py-2 text-sm text-foreground"
                          >
                            <option value="hashtag">hashtag</option>
                            <option value="tag">tag</option>
                            <option value="content_substring">content_substring</option>
                            <option value="author_pubkey">author_pubkey</option>
                            <option value="event_kind">event_kind</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-foreground-secondary mb-1">Operator</label>
                          <select
                            value={trigger.operator || 'equals'}
                            onChange={(event) => handleTriggerChange(index, 'operator', event.target.value)}
                            className="w-full rounded-md border border-border bg-background-elevated px-3 py-2 text-sm text-foreground"
                          >
                            <option value="equals">equals</option>
                            <option value="contains">contains</option>
                            <option value="in">in</option>
                          </select>
                        </div>
                      </div>

                      <Input
                        label="Value"
                        value={trigger.value}
                        onChange={(event) => handleTriggerChange(index, 'value', event.target.value)}
                        placeholder="#bitcoin or npub..."
                        required
                      />

                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={!!trigger.case_sensitive}
                            onChange={(event) => handleTriggerChange(index, 'case_sensitive', event.target.checked)}
                          />
                          Case sensitive
                        </label>
                        {triggers.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => setTriggers((current) => current.filter((_, currentIndex) => currentIndex !== index))}>
                            <Trash2 size={14} className="mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="submit"
                  isLoading={isCreatingCampaign}
                  disabled={!triggers.some((trigger) => trigger.value.trim())}
                >
                  Crear campaña
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Campañas activas y historicas</CardTitle>
              <CardDescription>GET `/v1/nostr/campaigns` y detalle operativo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading && <p className="text-foreground-secondary">Cargando campañas...</p>}

              {!isLoading && !campaigns.length && (
                <EmptyState
                  variant="card"
                  title="No hay campañas Nostr"
                  description="Aun no existen campañas Nostr creadas."
                />
              )}

              {campaigns.map((campaign) => {
                const isExpanded = expandedCampaignId === campaign.id;
                const remainingBudget =
                  campaign.budget_total_sat - campaign.budget_reserved_sat - campaign.budget_spent_sat + campaign.budget_refunded_sat;

                return (
                  <div key={campaign.id} className="rounded-lg border border-border p-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-lg">{campaign.name}</p>
                            <Badge variant={statusVariant(campaign.status)}>{campaign.status}</Badge>
                            <Badge variant="subtle">{campaign.funding_mode}</Badge>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-2">
                            <StatTile label="Reward" value={`${formatSats(campaign.reward_amount_sat)} sats`} size="sm" />
                            <StatTile label="Total budget" value={`${formatSats(campaign.budget_total_sat)} sats`} size="sm" />
                            <StatTile label="Reserved" value={`${formatSats(campaign.budget_reserved_sat)} sats`} size="sm" />
                            <StatTile label="Spent" value={`${formatSats(campaign.budget_spent_sat)} sats`} size="sm" />
                            <StatTile label="Remaining" value={`${formatSats(Math.max(0, remainingBudget))} sats`} size="sm" />
                            <StatTile label="Updated" value={formatDate(campaign.updated_at, false)} size="sm" />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button variant="ghost" onClick={() => setExpandedCampaignId(isExpanded ? null : campaign.id)}>
                            {isExpanded ? 'Ocultar detalle' : 'Ver detalle'}
                          </Button>
                          {renderCampaignActions(campaign)}
                        </div>
                      </div>

                      {latestExternalFunding?.campaignId === campaign.id && latestExternalFunding.funding.payment_request && (
                        <div className="rounded-lg border border-accent-bitcoin/20 bg-accent-bitcoin/10 p-4 space-y-2">
                          <p className="font-medium">Invoice externa lista</p>
                          <textarea
                            readOnly
                            value={latestExternalFunding.funding.payment_request || ''}
                            rows={3}
                            className="w-full rounded-md border border-border bg-background-elevated px-3 py-2 text-sm font-mono text-foreground"
                          />
                          <p className="text-xs text-foreground-secondary">
                            Payment hash: {latestExternalFunding.funding.payment_hash || '--'}
                          </p>
                        </div>
                      )}

                      {isExpanded && (
                        <div className="grid xl:grid-cols-3 gap-4 pt-2">
                          <div className="xl:col-span-1 rounded-lg bg-background-elevated p-4 space-y-3">
                            <p className="font-medium">Triggers</p>
                            {(selectedCampaign?.triggers || campaign.triggers || []).map((trigger) => (
                              <div key={trigger.id} className="rounded-md border border-border px-3 py-2 text-sm">
                                <p className="font-medium">{trigger.trigger_type}</p>
                                <p className="text-foreground-secondary">
                                  {trigger.operator} {trigger.value}
                                </p>
                              </div>
                            ))}
                            {!selectedCampaign?.triggers?.length && !campaign.triggers?.length && (
                              <p className="text-sm text-foreground-secondary">Sin triggers cargados.</p>
                            )}
                          </div>

                          <div className="xl:col-span-1 rounded-lg bg-background-elevated p-4 space-y-3">
                            <p className="font-medium">Matches</p>
                            {matches.slice(0, 5).map((match) => (
                              <div key={match.id} className="rounded-md border border-border px-3 py-2 text-sm">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium">{match.status}</span>
                                  <span className="text-xs text-foreground-secondary">{formatDate(match.created_at, false)}</span>
                                </div>
                                <p className="text-foreground-secondary">Kind {match.event_kind}</p>
                                <p className="font-mono text-xs">{truncateAddress(match.event_pubkey, 8)}</p>
                              </div>
                            ))}
                            {!matches.length && <p className="text-sm text-foreground-secondary">Todavia no hay matches detectados.</p>}
                          </div>

                          <div className="xl:col-span-1 rounded-lg bg-background-elevated p-4 space-y-3">
                            <p className="font-medium">Payouts</p>
                            {payouts.slice(0, 5).map((payout) => (
                              <div key={payout.id} className="rounded-md border border-border px-3 py-2 text-sm">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium">{payout.status}</span>
                                  <span className="font-mono">{formatSats(payout.amount_sat)} sats</span>
                                </div>
                                <p className="font-mono text-xs">{truncateAddress(payout.recipient_pubkey, 8)}</p>
                                <p className="text-xs text-foreground-secondary">{formatDate(payout.created_at, false)}</p>
                              </div>
                            ))}
                            {!payouts.length && <p className="text-sm text-foreground-secondary">No hay payouts registrados.</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
