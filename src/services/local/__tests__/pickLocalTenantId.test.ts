import { describe, it, expect } from 'vitest';
import { pickLocalTenantId } from '../localApi';

/**
 * 本机登录区 ID 探测的取值判据（S2 契约：X-Tenant-ID 只认后端雪花 ID）。
 * 迁移残留的 u_* 目录键不是后端 ID，必须跳过并回手填（返回 ''）。
 */
describe('pickLocalTenantId（本机 identity → 后端雪花租户 ID）', () => {
  it('活跃租户 id 本身就是雪花时直接取', () => {
    expect(
      pickLocalTenantId({ tenant_id: '9007199254740991', tenants: [{ id: '9007199254740991', name: 'MyNet Platform' }] })
    ).toBe('9007199254740991');
  });

  it('u_* 残留键优先用 real_tenant_id', () => {
    expect(
      pickLocalTenantId({
        tenant_id: 'u_3844197700300659',
        real_tenant_id: '9007199254740991',
        tenants: [{ id: 'u_3844197700300659', name: '区' }]
      })
    ).toBe('9007199254740991');
  });

  it('活跃项在列表里时取该项的 real/id（活跃项优先于列表其余项）', () => {
    expect(
      pickLocalTenantId({
        tenant_id: 'u_1',
        tenants: [
          { id: 'u_1', real_tenant_id: '1111111111111111' },
          { id: '2222222222222222' }
        ]
      })
    ).toBe('1111111111111111');
  });

  it('活跃项没有真 ID 时才落到列表其余项的雪花', () => {
    expect(
      pickLocalTenantId({
        tenant_id: 'u_1',
        tenants: [{ id: 'u_1' }, { id: '2222222222222222' }]
      })
    ).toBe('2222222222222222');
  });

  it('挑不出数字（全是残留键 / 空数据）→ 空串，调用方回手填', () => {
    expect(pickLocalTenantId({ tenant_id: 'u_1', tenants: [{ id: 'u_1' }] })).toBe('');
    expect(pickLocalTenantId({})).toBe('');
    expect(pickLocalTenantId(null)).toBe('');
    expect(pickLocalTenantId('garbage')).toBe('');
    expect(pickLocalTenantId({ tenant_id: '' })).toBe('');
  });
});
