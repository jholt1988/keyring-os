'use client';

import { useState } from 'react';
import type { ReadOnlyOperatorData } from '@/lib/operator/read-only-data';
import { createSetupProperty, createSetupUnit } from '@/lib/operator/read-only-data';
import { MetricTile } from '../components/metric-tile';
import { SetupInput } from '../components/filter-select';
import { formatCurrency, formatNumber, propertyAddress, countUnitsByStatus } from '../utils';
import { Building2, CalendarClock, Home, Users } from 'lucide-react';

export function PortfolioView({
  data,
  totals,
  loaded,
  token,
  onRefresh,
}: {
  data: ReadOnlyOperatorData;
  totals: { properties: number; units: number; occupied: number; vacant: number; occupancy: number };
  loaded: boolean;
  token: string;
  onRefresh: () => Promise<void>;
}) {
  const [propertyForm, setPropertyForm] = useState({ name: '', address: '', city: '', state: 'KS', zipCode: '', propertyType: 'Residential' });
  const [unitForm, setUnitForm] = useState({ propertyId: '', name: '', unitNumber: '', bedrooms: '', bathrooms: '', squareFeet: '', status: 'VACANT' });
  const [setupMessage, setSetupMessage] = useState<string | null>(null);
  const [setupPending, setSetupPending] = useState(false);

  async function submitProperty() {
    if (!propertyForm.name.trim() || !propertyForm.address.trim()) {
      setSetupMessage('Property name and address are required.');
      return;
    }
    setSetupPending(true);
    setSetupMessage(null);
    try {
      await createSetupProperty({
        name: propertyForm.name.trim(),
        address: propertyForm.address.trim(),
        city: propertyForm.city.trim() || undefined,
        state: propertyForm.state.trim() || undefined,
        zipCode: propertyForm.zipCode.trim() || undefined,
        propertyType: propertyForm.propertyType.trim() || undefined,
      }, { token });
      setPropertyForm({ name: '', address: '', city: '', state: 'KS', zipCode: '', propertyType: 'Residential' });
      setSetupMessage('Property created.');
      await onRefresh();
    } catch (error) {
      setSetupMessage(error instanceof Error ? error.message : 'Unable to create property.');
    } finally {
      setSetupPending(false);
    }
  }

  async function submitUnit() {
    if (!unitForm.propertyId || !unitForm.name.trim()) {
      setSetupMessage('Select a property and enter a unit name.');
      return;
    }
    setSetupPending(true);
    setSetupMessage(null);
    try {
      await createSetupUnit(unitForm.propertyId, {
        name: unitForm.name.trim(),
        unitNumber: unitForm.unitNumber.trim() || undefined,
        status: unitForm.status,
        bedrooms: unitForm.bedrooms ? Number(unitForm.bedrooms) : undefined,
        bathrooms: unitForm.bathrooms ? Number(unitForm.bathrooms) : undefined,
        squareFeet: unitForm.squareFeet ? Number(unitForm.squareFeet) : undefined,
      }, { token });
      setUnitForm((current) => ({ ...current, name: '', unitNumber: '', bedrooms: '', bathrooms: '', squareFeet: '', status: 'VACANT' }));
      setSetupMessage('Unit created.');
      await onRefresh();
    } catch (error) {
      setSetupMessage(error instanceof Error ? error.message : 'Unable to create unit.');
    } finally {
      setSetupPending(false);
    }
  }

  return (
    <div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Properties" value={formatNumber(totals.properties)} detail="portfolio records" icon={Building2} />
        <MetricTile label="Units" value={formatNumber(totals.units)} detail="read-only unit count" icon={Home} />
        <MetricTile label="Vacant" value={formatNumber(totals.vacant)} detail="available or turning soon" icon={CalendarClock} />
        <MetricTile label="Tenants" value={formatNumber(data.metrics?.occupancy?.occupied)} detail="occupied unit proxy" icon={Users} />
      </div>

      <section className="mb-6 rounded-md border border-[var(--border)] bg-[var(--panel)] p-4" aria-labelledby="setup-title">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="setup-title" className="text-lg font-semibold">Property and unit setup</h2>
            <p className="text-sm text-[var(--muted)]">Create beta portfolio records through audited Phase 3 setup contracts.</p>
          </div>
          <span className="text-sm text-[var(--muted)]">{data.setup ? `${data.setup.metrics?.unitsMissingDetails ?? 0} units need details` : 'Waiting for setup summary'}</span>
        </div>

        {setupMessage ? <div className="mb-3 rounded-md border border-[var(--border)] bg-[var(--panel-strong)] p-3 text-sm text-[var(--muted)]">{setupMessage}</div> : null}

        <div className="grid gap-5 xl:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold">Add property</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <SetupInput label="Name" value={propertyForm.name} onChange={(name) => setPropertyForm((current) => ({ ...current, name }))} />
              <SetupInput label="Address" value={propertyForm.address} onChange={(address) => setPropertyForm((current) => ({ ...current, address }))} />
              <SetupInput label="City" value={propertyForm.city} onChange={(city) => setPropertyForm((current) => ({ ...current, city }))} />
              <SetupInput label="State" value={propertyForm.state} onChange={(state) => setPropertyForm((current) => ({ ...current, state }))} />
              <SetupInput label="Zip" value={propertyForm.zipCode} onChange={(zipCode) => setPropertyForm((current) => ({ ...current, zipCode }))} />
              <SetupInput label="Type" value={propertyForm.propertyType} onChange={(propertyType) => setPropertyForm((current) => ({ ...current, propertyType }))} />
            </div>
            <button disabled={setupPending} onClick={() => void submitProperty()} className="mt-3 rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50">Create property</button>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Add unit</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <label className="text-xs font-medium text-[var(--muted)]">
                Property
                <select value={unitForm.propertyId} onChange={(event) => setUnitForm((current) => ({ ...current, propertyId: event.target.value }))} className="mt-1 h-9 w-full rounded-md border border-[var(--border)] bg-[var(--panel)] px-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]">
                  <option value="">Select property</option>
                  {data.portfolio.data.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}
                </select>
              </label>
              <SetupInput label="Unit name" value={unitForm.name} onChange={(name) => setUnitForm((current) => ({ ...current, name }))} />
              <SetupInput label="Unit number" value={unitForm.unitNumber} onChange={(unitNumber) => setUnitForm((current) => ({ ...current, unitNumber }))} />
              <SetupInput label="Bedrooms" value={unitForm.bedrooms} onChange={(bedrooms) => setUnitForm((current) => ({ ...current, bedrooms }))} />
              <SetupInput label="Bathrooms" value={unitForm.bathrooms} onChange={(bathrooms) => setUnitForm((current) => ({ ...current, bathrooms }))} />
              <SetupInput label="Sq ft" value={unitForm.squareFeet} onChange={(squareFeet) => setUnitForm((current) => ({ ...current, squareFeet }))} />
            </div>
            <button disabled={setupPending} onClick={() => void submitUnit()} className="mt-3 rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50">Create unit</button>
          </div>
        </div>
      </section>

      <section aria-labelledby="portfolio-title">
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="portfolio-title" className="text-lg font-semibold">Portfolio</h2>
            <p className="text-sm text-[var(--muted)]">Property and unit visibility only. Editing remains in the legacy app until write contracts are ported.</p>
          </div>
          <span className="text-sm text-[var(--muted)]">{loaded ? `${data.portfolio.data.length} rows` : 'Waiting for data'}</span>
        </div>

        <div className="overflow-hidden rounded-md border border-[var(--border)] bg-[var(--panel)]">
          <div className="hidden grid-cols-[1.4fr_1fr_120px_120px_120px] gap-4 border-b border-[var(--border)] bg-[var(--panel-strong)] px-4 py-3 text-xs font-semibold uppercase text-[var(--muted)] md:grid">
            <div>Property</div>
            <div>Address</div>
            <div>Units</div>
            <div>Vacant</div>
            <div>Rent band</div>
          </div>

          {data.portfolio.data.length === 0 && (
            <div className="p-5 text-sm text-[var(--muted)]">No properties returned by `/api/properties`.</div>
          )}

          {data.portfolio.data.map((property) => (
            <div key={property.id} className="grid gap-3 border-b border-[var(--border)] px-4 py-4 last:border-b-0 md:grid-cols-[1.4fr_1fr_120px_120px_120px] md:items-center">
              <div>
                <div className="font-semibold">{property.name}</div>
                <div className="mt-1 text-xs text-[var(--muted)]">{property.propertyType ?? 'Residential'}</div>
              </div>
              <div className="text-sm text-[var(--muted)]">{propertyAddress(property) || 'No address on file'}</div>
              <div className="text-sm">
                <span className="md:hidden text-[var(--muted)]">Units: </span>
                {formatNumber(property.units?.length)}
              </div>
              <div className="text-sm">
                <span className="md:hidden text-[var(--muted)]">Vacant: </span>
                {formatNumber(countUnitsByStatus(property, 'VACANT'))}
              </div>
              <div className="text-sm">
                <span className="md:hidden text-[var(--muted)]">Rent: </span>
                {property.minRent || property.maxRent ? `${formatCurrency(property.minRent)}-${formatCurrency(property.maxRent)}` : 'Not set'}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
