'use client';

import { useState } from 'react';
import type { Profile, UserRole } from '@/types/database';

const ROLE_LABEL: Record<string, string> = {
  admin: '관리자',
  pastor: '목회자',
  member: '성도',
};

export default function MembersTable({ initial }: { initial: Profile[] }) {
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function patch(id: string, updates: Partial<Profile>) {
    setBusy(id);
    const res = await fetch('/api/admin/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    setBusy(null);
    if (res.ok) {
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );
    }
  }

  if (rows.length === 0) {
    return <p className="py-10 text-center text-sm text-gray-500">회원이 없습니다.</p>;
  }

  return (
    <div className="space-y-2">
      {rows.map((m) => {
        const pendingPastor = m.role === 'pastor' && !m.approved;
        return (
          <div
            key={m.id}
            className={`rounded-xl border p-4 ${
              pendingPastor
                ? 'border-brand-300 bg-brand-50 dark:bg-brand-900/20'
                : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-gray-900 dark:text-white">
                  {m.display_name || m.email}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {m.email}
                  {m.church_name ? ` · ${m.church_name}` : ''}
                  {m.position ? ` · ${m.position}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md px-2 py-1 text-xs font-medium ${
                    pendingPastor
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  {ROLE_LABEL[m.role]}
                  {pendingPastor ? ' (승인 대기)' : ''}
                </span>

                {pendingPastor && (
                  <button
                    onClick={() => patch(m.id, { approved: true })}
                    disabled={busy === m.id}
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    승인
                  </button>
                )}

                <select
                  value={m.role}
                  onChange={(e) =>
                    patch(m.id, { role: e.target.value as UserRole })
                  }
                  disabled={busy === m.id}
                  className="rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-xs dark:border-gray-700"
                >
                  <option value="member">성도</option>
                  <option value="pastor">목회자</option>
                  <option value="admin">관리자</option>
                </select>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
