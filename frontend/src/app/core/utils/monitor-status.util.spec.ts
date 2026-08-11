import { countActiveMonitorsByStatus, normalizeMonitorStatus } from './monitor-status.util';

describe('monitor status utils', () => {
  it('normalizes statuses consistently', () => {
    expect(normalizeMonitorStatus(1)).toBe('UP');
    expect(normalizeMonitorStatus(0)).toBe('DOWN');
    expect(normalizeMonitorStatus(2)).toBe('PENDING');
    expect(normalizeMonitorStatus(3)).toBe('MAINTENANCE');
    expect(normalizeMonitorStatus(4)).toBe('DEGRADED');
  });

  it('does not count paused monitors as down', () => {
    const monitors = [
      { id: '1', isActive: true, status: 'UP' as const },
      { id: '2', isActive: true, status: 'DOWN' as const },
      { id: '3', isActive: false, status: 'DOWN' as const },
      { id: '4', isActive: false, status: 'PENDING' as const },
      { id: '5', isActive: true, status: 'DEGRADED' as const },
    ];

    expect(countActiveMonitorsByStatus(monitors, 'DOWN')).toBe(1);
    expect(countActiveMonitorsByStatus(monitors, 'DEGRADED')).toBe(1);
  });
});
