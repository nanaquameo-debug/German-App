import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateGroupCode,
  aggregateGroupCart,
  calculateBillSplit,
  isSessionExpired,
} from './groupOrder';
import { CartItem, GroupMember, GroupOrderSession } from '../types';

const mockMembers: GroupMember[] = [
  {
    id: 'host-1',
    name: 'Marcus (Host)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    isHost: true,
    joinedAt: '2026-10-26T10:00:00Z',
  },
  {
    id: 'friend-1',
    name: 'Sophie',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    isHost: false,
    joinedAt: '2026-10-26T10:02:00Z',
  },
  {
    id: 'friend-2',
    name: 'Alexandre',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61',
    isHost: false,
    joinedAt: '2026-10-26T10:04:00Z',
  },
];

const mockItems: CartItem[] = [
  {
    cartItemId: 'item-1',
    menuItem: {
      id: 'd1',
      name: 'Burger',
      nameDe: 'Burger',
      nameFr: 'Burger',
      description: '',
      descriptionDe: '',
      descriptionFr: '',
      price: 15.0,
      imageUrl: '',
      category: 'Burgers',
      taxCategory: 'food_standard',
      dietaryTags: [],
    },
    restaurantId: 'r1',
    restaurantName: 'Burger Lab',
    quantity: 1,
    selectedOptions: [],
    itemSubtotal: 15.0,
    addedBy: {
      id: 'host-1',
      name: 'Marcus (Host)',
      avatar: '',
    },
  },
  {
    cartItemId: 'item-2',
    menuItem: {
      id: 'd2',
      name: 'Truffle Burger',
      nameDe: 'Trüffel Burger',
      nameFr: 'Burger Truffe',
      description: '',
      descriptionDe: '',
      descriptionFr: '',
      price: 25.0,
      imageUrl: '',
      category: 'Burgers',
      taxCategory: 'food_standard',
      dietaryTags: [],
    },
    restaurantId: 'r1',
    restaurantName: 'Burger Lab',
    quantity: 1,
    selectedOptions: [],
    itemSubtotal: 25.0,
    addedBy: {
      id: 'friend-1',
      name: 'Sophie',
      avatar: '',
    },
  },
];

test('generateGroupCode returns valid format starting with VD-GRP-', () => {
  const code = generateGroupCode();
  assert.ok(code.startsWith('VD-GRP-'));
  assert.equal(code.length, 11);
});

test('aggregateGroupCart correctly groups items and flags spending limit violations', () => {
  // With spending limit of €20.00: Sophie has €25.00, so should be flagged
  const result = aggregateGroupCart(mockItems, mockMembers, 20.0);

  assert.equal(result.totalGroupItems, 2);
  assert.equal(result.totalGroupSubtotal, 40.0);
  assert.equal(result.hasSpendingLimitViolations, true);

  const sophieSummary = result.memberSummaries.find((m) => m.memberId === 'friend-1');
  assert.ok(sophieSummary);
  assert.equal(sophieSummary.subtotal, 25.0);
  assert.equal(sophieSummary.exceedsSpendingLimit, true);

  const marcusSummary = result.memberSummaries.find((m) => m.memberId === 'host-1');
  assert.ok(marcusSummary);
  assert.equal(marcusSummary.subtotal, 15.0);
  assert.equal(marcusSummary.exceedsSpendingLimit, false);
});

test('calculateBillSplit handles host_pays mode where host covers full balance', () => {
  const splits = calculateBillSplit(mockItems, mockMembers, 3.0, 2.0, 2.8, 'host_pays');

  const hostShare = splits.find((s) => s.memberId === 'host-1');
  const friendShare = splits.find((s) => s.memberId === 'friend-1');

  assert.ok(hostShare);
  assert.ok(friendShare);
  // Total = 40.0 subtotal + 3.0 delivery + 2.0 tip = 45.0
  assert.equal(hostShare.totalOwed, 45.0);
  assert.equal(friendShare.totalOwed, 0);
});

test('calculateBillSplit handles pay_own mode with proportional fee distribution', () => {
  // Total subtotal = 40.0 (Marcus 15/40 = 37.5%, Sophie 25/40 = 62.5%)
  // Delivery = 4.0, Tip = 0.0 -> Marcus share = 15 + 1.50 = 16.50; Sophie share = 25 + 2.50 = 27.50
  const splits = calculateBillSplit(mockItems, mockMembers, 4.0, 0, 2.8, 'pay_own');

  const hostShare = splits.find((s) => s.memberId === 'host-1');
  const friendShare = splits.find((s) => s.memberId === 'friend-1');

  assert.equal(hostShare?.totalOwed, 16.5);
  assert.equal(friendShare?.totalOwed, 27.5);
});

test('isSessionExpired detects past expiration dates', () => {
  const session: GroupOrderSession = {
    id: 'grp-1',
    code: 'VD-GRP-1234',
    restaurantId: 'r1',
    restaurantName: 'Burger Lab',
    host: mockMembers[0],
    members: mockMembers,
    cutoffMinutes: 15,
    createdAt: '2026-10-26T10:00:00Z',
    expiresAt: '2026-10-26T10:15:00Z',
    status: 'open',
    splitMode: 'host_pays',
    joinUrl: 'https://voltdash.eu/join/VD-GRP-1234',
  };

  assert.equal(isSessionExpired(session, '2026-10-26T10:10:00Z'), false);
  assert.equal(isSessionExpired(session, '2026-10-26T10:15:01Z'), true);
});
