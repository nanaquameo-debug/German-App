import { CartItem, GroupMember, GroupOrderSession } from '../types';

/**
 * Generates a clean, readable group order session code
 */
export function generateGroupCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `VD-GRP-${num}`;
}

export interface MemberCartSummary {
  memberId: string;
  memberName: string;
  avatar: string;
  isHost: boolean;
  itemCount: number;
  subtotal: number;
  exceedsSpendingLimit: boolean;
}

/**
 * Summarizes the shared cart by participant
 */
export function aggregateGroupCart(
  items: CartItem[],
  members: GroupMember[],
  spendingLimitPerPerson?: number
): {
  memberSummaries: MemberCartSummary[];
  totalGroupItems: number;
  totalGroupSubtotal: number;
  hasSpendingLimitViolations: boolean;
} {
  const memberMap: Record<string, MemberCartSummary> = {};

  // Initialize with all joined members
  for (const m of members) {
    memberMap[m.id] = {
      memberId: m.id,
      memberName: m.name,
      avatar: m.avatar,
      isHost: m.isHost,
      itemCount: 0,
      subtotal: 0,
      exceedsSpendingLimit: false,
    };
  }

  // Accumulate cart items
  for (const item of items) {
    const memberId = item.addedBy?.id || (members.find((m) => m.isHost)?.id || 'host-1');
    if (!memberMap[memberId]) {
      memberMap[memberId] = {
        memberId,
        memberName: item.addedBy?.name || 'Guest',
        avatar: item.addedBy?.avatar || '',
        isHost: false,
        itemCount: 0,
        subtotal: 0,
        exceedsSpendingLimit: false,
      };
    }
    memberMap[memberId].itemCount += item.quantity;
    memberMap[memberId].subtotal += item.itemSubtotal;
  }

  // Check spending limits if configured
  let hasSpendingLimitViolations = false;
  for (const key of Object.keys(memberMap)) {
    const summary = memberMap[key];
    summary.subtotal = Number(summary.subtotal.toFixed(2));
    if (spendingLimitPerPerson && spendingLimitPerPerson > 0 && summary.subtotal > spendingLimitPerPerson) {
      summary.exceedsSpendingLimit = true;
      hasSpendingLimitViolations = true;
    }
  }

  const memberSummaries = Object.values(memberMap);
  const totalGroupItems = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalGroupSubtotal = Number(
    items.reduce((acc, curr) => acc + curr.itemSubtotal, 0).toFixed(2)
  );

  return {
    memberSummaries,
    totalGroupItems,
    totalGroupSubtotal,
    hasSpendingLimitViolations,
  };
}

export interface MemberSplitShare {
  memberId: string;
  memberName: string;
  subtotal: number;
  deliveryShare: number;
  tipShare: number;
  taxShare: number;
  totalOwed: number;
}

/**
 * Calculates per-member payment obligations according to split mode
 */
export function calculateBillSplit(
  items: CartItem[],
  members: GroupMember[],
  deliveryFee: number,
  tipAmount: number,
  totalTax: number,
  splitMode: 'host_pays' | 'split_evenly' | 'pay_own'
): MemberSplitShare[] {
  const { memberSummaries, totalGroupSubtotal } = aggregateGroupCart(items, members);
  const activeMembers = members.filter(
    (m) => memberSummaries.some((s) => s.memberId === m.id && s.itemCount > 0) || m.isHost
  );
  const count = Math.max(1, activeMembers.length);

  const grandTotal = Number((totalGroupSubtotal + deliveryFee + tipAmount).toFixed(2));

  if (splitMode === 'host_pays') {
    return members.map((m) => {
      const summary = memberSummaries.find((s) => s.memberId === m.id);
      const subtotal = summary?.subtotal || 0;
      return {
        memberId: m.id,
        memberName: m.name,
        subtotal,
        deliveryShare: m.isHost ? deliveryFee : 0,
        tipShare: m.isHost ? tipAmount : 0,
        taxShare: m.isHost ? totalTax : 0,
        totalOwed: m.isHost ? grandTotal : 0,
      };
    });
  }

  if (splitMode === 'split_evenly') {
    const equalShare = Number((grandTotal / count).toFixed(2));
    const equalDelivery = Number((deliveryFee / count).toFixed(2));
    const equalTip = Number((tipAmount / count).toFixed(2));
    const equalTax = Number((totalTax / count).toFixed(2));

    return members.map((m) => {
      const summary = memberSummaries.find((s) => s.memberId === m.id);
      return {
        memberId: m.id,
        memberName: m.name,
        subtotal: summary?.subtotal || 0,
        deliveryShare: equalDelivery,
        tipShare: equalTip,
        taxShare: equalTax,
        totalOwed: equalShare,
      };
    });
  }

  // 'pay_own': proportional split of common fees
  return members.map((m) => {
    const summary = memberSummaries.find((s) => s.memberId === m.id);
    const subtotal = summary?.subtotal || 0;
    const ratio = totalGroupSubtotal > 0 ? subtotal / totalGroupSubtotal : 1 / count;

    const deliveryShare = Number((deliveryFee * ratio).toFixed(2));
    const tipShare = Number((tipAmount * ratio).toFixed(2));
    const taxShare = Number((totalTax * ratio).toFixed(2));
    const totalOwed = Number((subtotal + deliveryShare + tipShare).toFixed(2));

    return {
      memberId: m.id,
      memberName: m.name,
      subtotal,
      deliveryShare,
      tipShare,
      taxShare,
      totalOwed,
    };
  });
}

/**
 * Checks if a session has expired based on cutoff minutes
 */
export function isSessionExpired(session: GroupOrderSession, currentTimeISO?: string): boolean {
  const now = currentTimeISO ? new Date(currentTimeISO).getTime() : Date.now();
  const expires = new Date(session.expiresAt).getTime();
  return now >= expires;
}
