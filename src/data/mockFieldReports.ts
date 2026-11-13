/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FieldReport, ActivityId } from '../types';

const activities: ActivityId[] = ['beach', 'swim', 'kids', 'surf', 'sup', 'sail'];

export const MOCK_FIELD_REPORTS: FieldReport[] = [
  {
    id: '1',
    beachId: 'tel-aviv-marina',
    activity: 'surf',
    isAccurate: true,
    reason: 'גלים טובים',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
  },
  {
    id: '2',
    beachId: 'tel-aviv-marina',
    activity: 'surf',
    isAccurate: true,
    reason: '☀️ מזג אוויר טוב',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
  },
  {
    id: '3',
    beachId: 'tel-aviv-marina',
    activity: 'surf',
    isAccurate: false,
    reason: '🌊 הגלים לא מתאימים',
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), 
  },
  {
    id: '4',
    beachId: 'herzliya-acadia',
    activity: 'sup',
    isAccurate: true,
    reason: '💨 רוח נוחה',
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: '5',
    beachId: 'herzliya-acadia',
    activity: 'sup',
    isAccurate: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  }
];
