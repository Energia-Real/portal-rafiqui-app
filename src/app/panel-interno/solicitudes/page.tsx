'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useHydration } from '@/hooks/useHydration';
import {
  ClipboardList,
  RefreshCw,
  Loader2,
  MapPin,
  Calendar,
  Hash,
  User,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  SearchX,
  InboxIcon,
} from 'lucide-react';
import { collectionRequestsApi, CollectionRequest } from '@/lib/api';
import { ToastContainer, useToast } from '@/components/ui/Toast';

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:     { label: 'Pendiente',  color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  IN_PROGRESS: { label: 'En progreso', color: 'bg-primary-500/20 text-primary-400 border-primary-500/30' },
  COMPLETED:   { label: 'Completada', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
};

const ALLOWED_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-dark-700">
          {[40, 120, 160, 48, 90, 110, 48, 36].map((w, j) => (
            <td key={j} className="px-4 py-4">
              <div className="skeleton h-4 rounded" style={{ width: w }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Request row ───────────────────────────────────────────────────────────────
function RequestRow({
  request,
  onStatusChange,
}: {
  request: CollectionRequest;
  onStatusChange: (id: string, status: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === request.status) return;
    setUpdating(true);
    await onStatusChange(request.id, newStatus);
    setUpdating(false);
  };

  return (
    <>
      <tr className="border-b border-dark-700 hover:bg-dark-700/40 transition-colors">
        {/* ID */}
        <td className="px-4 py-3 text-xs text-dark-400 font-mono">
          {request.id.slice(0, 8)}…
        </td>

        {/* Contacto */}
        <td className="px-4 py-3">
          {request.contactName ? (
            <div>
              <p className="text-sm text-white font-medium">{request.contactName}</p>
              <p className="text-xs text-dark-300">{request.contactPhone ?? '—'}</p>
            </div>
          ) : (
            <span className="text-xs text-dark-500 italic">Sin contacto</span>
          )}
        </td>

        {/* Dirección */}
        <td className="px-4 py-3 text-sm text-dark-300 max-w-[200px] truncate" title={request.pickupAddress}>
          {request.pickupAddress}
        </td>

        {/* Paneles */}
        <td className="px-4 py-3 text-sm text-white text-center font-semibold">
          {request.estimatedCount}
        </td>

        {/* Estado — select */}
        <td className="px-4 py-3 text-center">
          <div className="inline-flex items-center gap-1.5">
            <select
              value={request.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              aria-label={`Cambiar estado de solicitud ${request.id.slice(0, 8)}`}
              className={`appearance-none text-xs font-medium px-2.5 py-1 rounded-full border cursor-pointer bg-dark-800 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors disabled:opacity-60 ${
                STATUS_LABELS[request.status]?.color ?? 'bg-dark-600 text-dark-300 border-dark-500'
              }`}
            >
              {ALLOWED_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-dark-800 text-white">
                  {STATUS_LABELS[s]?.label ?? s}
                </option>
              ))}
            </select>
            {updating && <Loader2 size={12} className="animate-spin text-dark-400 shrink-0" />}
          </div>
        </td>

        {/* Fecha */}
        <td className="px-4 py-3 text-xs text-dark-300">
          {formatDate(request.createdAt)}
        </td>

        {/* Partner */}
        <td className="px-4 py-3 text-center">
          {request.partnerId ? (
            <div className="flex flex-col items-center gap-1">
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
              <span className="text-xs font-semibold text-green-400 leading-tight text-center">
                {request.partner?.name ?? 'Partner'}
              </span>
            </div>
          ) : request.wantsToBePartner ? (
            <div className="flex flex-col items-center gap-1">
              <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-4 w-4 rounded-full bg-primary-500 opacity-75 animate-ping" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-primary-500 shadow-[0_0_8px_#E6086A]" />
              </div>
              <span className="text-xs font-semibold text-primary-400 leading-tight text-center whitespace-nowrap">
                Quiere ser<br />partner
              </span>
            </div>
          ) : null}
        </td>

        {/* Detalle */}
        <td className="px-4 py-3 text-center">
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? 'Ocultar detalle' : 'Ver detalle'}
            className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </td>
      </tr>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-dark-800/60 border-b border-dark-700"
          >
            <td colSpan={8} className="px-6 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <p className="text-dark-400 text-xs mb-1">ID completo</p>
                  <p className="text-white font-mono text-xs break-all">{request.id}</p>
                </div>
                {request.donor && (
                  <div>
                    <p className="text-dark-400 text-xs mb-1">ID Donante</p>
                    <p className="text-white font-mono text-xs break-all">{request.donor.id}</p>
                  </div>
                )}
                <div>
                  <p className="text-dark-400 text-xs mb-1">Dirección completa</p>
                  <p className="text-white text-xs">{request.pickupAddress}</p>
                </div>
                {request.panelType && (
                  <div>
                    <p className="text-dark-400 text-xs mb-1">Tipo de instalación</p>
                    <p className="text-white text-xs capitalize">
                      {request.panelType === 'residential' ? 'Residencial' : 'Industrial'}
                    </p>
                  </div>
                )}
              </div>

              {request.panels && request.panels.length > 0 && (
                <div>
                  <p className="text-dark-400 text-xs mb-2 font-medium">Paneles a recolectar</p>
                  <div className="bg-dark-700/50 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-dark-600">
                          <th className="text-left px-3 py-2 text-dark-400 font-medium">Marca</th>
                          <th className="text-left px-3 py-2 text-dark-400 font-medium">Modelo</th>
                          <th className="text-center px-3 py-2 text-dark-400 font-medium">Cantidad</th>
                          <th className="text-center px-3 py-2 text-dark-400 font-medium">Tipo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {request.panels.map((panel, idx) => (
                          <tr key={panel.id ?? idx} className="border-b border-dark-600/50 last:border-0">
                            <td className="px-3 py-2 text-white">{panel.brand}</td>
                            <td className="px-3 py-2 text-white">{panel.model}</td>
                            <td className="px-3 py-2 text-white text-center font-semibold">{panel.quantity}</td>
                            <td className="px-3 py-2 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                panel.isCustom
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-primary-500/20 text-primary-400'
                              }`}>
                                {panel.isCustom ? 'Personalizado' : 'Catálogo'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function SolicitudesPage() {
  const router = useRouter();
  const hydrated = useHydration();
  const { isAuthenticated, token } = useAuthStore();
  const { toasts, addToast, dismiss } = useToast();
  const fetchedRef = useRef(false);

  const [requests, setRequests] = useState<CollectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof CollectionRequest>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    const result = await collectionRequestsApi.getAll(token ?? undefined);
    if (result.error || !result.data) {
      setError(result.error ?? 'Error desconocido');
    } else {
      setRequests(result.data);
    }
    setIsLoading(false);
  };

  const handleStatusChange = async (id: string, status: string) => {
    const result = await collectionRequestsApi.updateStatus(id, status, token ?? '');
    if (result.data) {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: result.data!.status } : r))
      );
      addToast(`Estado actualizado a "${STATUS_LABELS[status]?.label ?? status}"`, 'success');
    } else {
      addToast(result.error ?? 'No se pudo actualizar el estado', 'error');
    }
  };

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) { router.replace('/login'); return; }
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchRequests();
  }, [hydrated, isAuthenticated]);

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const toggleSort = (field: keyof CollectionRequest) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const statuses = ['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'];

  const filtered = requests
    .filter((r) => statusFilter === 'ALL' || r.status === statusFilter)
    .sort((a, b) => {
      const va = String(a[sortField] ?? '');
      const vb = String(b[sortField] ?? '');
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const SortButton = ({ field, label }: { field: keyof CollectionRequest; label: string }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 hover:text-white transition-colors"
    >
      {label}
      {sortField === field
        ? sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
        : null}
    </button>
  );

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary-500/10 rounded-lg">
                <ClipboardList className="text-primary-400" size={24} />
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
                Solicitudes de Recolección
              </h1>
            </div>
            <p className="text-dark-300">
              Panel interno •{' '}
              <span className="text-primary-400">{filtered.length} solicitudes</span>
            </p>
          </div>

          <button
            onClick={fetchRequests}
            disabled={isLoading}
            aria-label="Actualizar solicitudes"
            className="flex items-center gap-2 px-4 py-2 bg-dark-700 text-dark-300 hover:text-white rounded-xl transition-colors self-start disabled:opacity-60"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </motion.div>

        {/* Stats cards — always visible skeleton while loading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          {[
            { label: 'Pendientes',       key: 'PENDING',     icon: AlertCircle, color: 'text-amber-400' },
            { label: 'En progreso',      key: 'IN_PROGRESS', icon: RefreshCw,   color: 'text-blue-400' },
            { label: 'Completadas',      key: 'COMPLETED',   icon: Hash,        color: 'text-green-400' },
            { label: 'Paneles estimados', key: 'PANELS',     icon: Layers,      color: 'text-primary-400' },
          ].map(({ label, key, icon: Icon, color }) => (
            <div key={label} className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className={color} />
                <span className="text-dark-300 text-xs">{label}</span>
              </div>
              {isLoading ? (
                <div className="skeleton h-8 w-12" />
              ) : (
                <p className={`text-2xl font-bold ${color}`}>
                  {key === 'PANELS'
                    ? requests.reduce((s, r) => s + r.estimatedCount, 0)
                    : requests.filter((r) => r.status === key).length}
                </p>
              )}
            </div>
          ))}
        </motion.div>

        {/* Filter pills */}
        {!error && (
          <div className="flex gap-2 mb-4 flex-wrap" role="group" aria-label="Filtrar por estado">
            {statuses.map((s) => {
              const label = s === 'ALL' ? 'Todos' : (STATUS_LABELS[s]?.label ?? s);
              const isActive = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  aria-pressed={isActive}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    isActive
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-dark-700 text-dark-300 border-dark-600 hover:border-dark-400'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* Table card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-0 overflow-hidden"
        >
          {/* Error state */}
          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="p-4 bg-red-500/10 rounded-full">
                <AlertCircle className="text-red-400" size={36} />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold mb-1">No se pudieron cargar las solicitudes</p>
                <p className="text-dark-300 text-sm">{error}</p>
              </div>
              <button onClick={fetchRequests} className="btn-primary mt-2">
                Reintentar
              </button>
            </div>
          )}

          {/* Empty state — no data */}
          {!isLoading && !error && requests.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-4"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="p-5 bg-dark-700/50 rounded-2xl"
              >
                <InboxIcon className="text-dark-400" size={44} />
              </motion.div>
              <div className="text-center">
                <p className="text-white font-semibold mb-1">Sin solicitudes aún</p>
                <p className="text-dark-300 text-sm max-w-xs">
                  Las solicitudes de recolección enviadas por los donantes aparecerán aquí.
                </p>
              </div>
            </motion.div>
          )}

          {/* Empty state — filtered */}
          {!isLoading && !error && requests.length > 0 && filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <div className="p-4 bg-dark-700/50 rounded-2xl">
                <SearchX className="text-dark-400" size={36} />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold mb-1">Sin resultados</p>
                <p className="text-dark-300 text-sm">No hay solicitudes con el filtro seleccionado.</p>
              </div>
              <button
                onClick={() => setStatusFilter('ALL')}
                className="text-primary-400 text-sm hover:text-primary-300 transition-colors"
              >
                Ver todas
              </button>
            </motion.div>
          )}

          {/* Table */}
          {!error && (isLoading || filtered.length > 0) && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-600 bg-dark-800/50">
                    <th className="px-4 py-3 text-left text-xs text-dark-400 font-medium">
                      <SortButton field="id" label="ID" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-dark-400 font-medium">
                      <div className="flex items-center gap-1"><User size={12} />Contacto</div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-dark-400 font-medium">
                      <div className="flex items-center gap-1"><MapPin size={12} />Dirección</div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs text-dark-400 font-medium">
                      <SortButton field="estimatedCount" label="Paneles" />
                    </th>
                    <th className="px-4 py-3 text-center text-xs text-dark-400 font-medium">
                      <SortButton field="status" label="Estado" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-dark-400 font-medium">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <SortButton field="createdAt" label="Fecha" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs text-dark-400 font-medium">Partner</th>
                    <th className="px-4 py-3 text-center text-xs text-dark-400 font-medium">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? <TableSkeleton />
                    : filtered.map((request) => (
                        <RequestRow
                          key={request.id}
                          request={request}
                          onStatusChange={handleStatusChange}
                        />
                      ))
                  }
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
