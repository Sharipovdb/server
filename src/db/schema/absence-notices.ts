import { boolean, index, integer, varchar } from 'drizzle-orm/pg-core';
import type { AbsenceScope, AbsenceType } from '../enums.ts';
import { baseEntityColumns, dateColumn, referenceId, transportation } from './common.ts';
import { users } from './identity.ts';

export const absenceNotices = transportation.table(
  'absence_notices',
  {
    ...baseEntityColumns,
    userId: referenceId('UserId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: dateColumn('Date').notNull(),
    scope: integer('Scope').$type<AbsenceScope>().notNull(),
    type: integer('Type').$type<AbsenceType>().notNull(),
    reason: varchar('Reason', { length: 500 }).notNull(),
    isNotified: boolean('IsNotified').notNull().default(false),
  },
  (table) => [index('IX_absence_notices_UserId').on(table.userId)],
);
