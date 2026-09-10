import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

interface Fix {
  readonly description: string;
  readonly pattern: RegExp;
  readonly replacement: string;
}

const SCHEMA_DIR = join('src', 'db', 'schema');

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function indexOpclasses(indexName: string, columns: Readonly<Record<string, string>>): Fix {
  const entries = Object.entries(columns);
  const anyOpclass = entries
    .map(([column]) => `${escapeRegExp(`table.${column}.asc().nullsLast().op(`)}"\\w+"\\)`)
    .join(', ');
  const fixedOpclass = entries
    .map(([column, opclass]) => `table.${column}.asc().nullsLast().op("${opclass}")`)
    .join(', ');

  return {
    description: `${indexName} operator classes`,
    pattern: new RegExp(
      `(Index\\("${escapeRegExp(indexName)}"\\)\\.using\\("btree", )${anyOpclass}`,
      'g',
    ),
    replacement: `$1${fixedOpclass}`,
  };
}

function primaryKeyColumns(constraintName: string, columns: readonly string[]): Fix {
  const fixedColumns = columns.map((column) => `table.${column}`).join(', ');

  return {
    description: `${constraintName} column order`,
    pattern: new RegExp(
      `primaryKey\\(\\{ columns: \\[[^\\]]*\\], name: "${escapeRegExp(constraintName)}"\\}\\)`,
      'g',
    ),
    replacement: `primaryKey({ columns: [${fixedColumns}], name: "${constraintName}"})`,
  };
}

const SCHEMA_FIXES: readonly Fix[] = [
  {
    description: 'schema-qualified identity sequence names',
    pattern: /name: "transportation\."([^"]+)""/g,
    replacement: 'name: "$1"',
  },
  {
    description: 'bigint identity maxValue beyond Number precision',
    pattern: /maxValue: 9223372036854775807 \}/g,
    replacement: 'maxValue: "9223372036854775807" }',
  },
  {
    description: 'unterminated empty string default',
    pattern: /\.default\('\)/g,
    replacement: ".default('')",
  },
  {
    description: 'date columns without explicit string mode',
    pattern: /\bdate\("(\w+)"\)/g,
    replacement: 'date("$1", { mode: \'string\' })',
  },
  {
    description: 'bigint mode hint comments',
    pattern:
      /^[ \t]*\/\/ You can use \{ mode: "bigint" \} if numbers are exceeding js number limitations\r?\n/gm,
    replacement: '',
  },
  {
    description: 'unused pgTable import',
    pattern: /\bpgTable, /g,
    replacement: '',
  },
  indexOpclasses('IX_transport_days_CrewId_Date', { crewId: 'int8_ops', date: 'date_ops' }),
  indexOpclasses('IX_TaxiExpense_TransportDayId_Leg_PaidById', {
    transportDayId: 'int8_ops',
    leg: 'int4_ops',
    paidById: 'int8_ops',
  }),
  indexOpclasses('IX_monthly_transport_sheets_CrewId_Year_Month', {
    crewId: 'int8_ops',
    year: 'int4_ops',
    month: 'int4_ops',
  }),
  primaryKeyColumns('PK_AspNetUserRoles', ['userId', 'roleId']),
  primaryKeyColumns('PK_AspNetUserLogins', ['loginProvider', 'providerKey']),
  primaryKeyColumns('PK_AspNetUserTokens', ['userId', 'loginProvider', 'name']),
];

const RELATIONS_FIXES: readonly Fix[] = [
  {
    description: 'schema import without .ts extension',
    pattern: /from ["']\.\/schema["']/g,
    replacement: "from './schema.ts'",
  },
];

function applyFixes(fileName: string, fixes: readonly Fix[]): string[] {
  const path = join(SCHEMA_DIR, fileName);
  let source = readFileSync(path, 'utf8');
  const failures: string[] = [];

  for (const fix of fixes) {
    const matches = source.match(fix.pattern)?.length ?? 0;

    if (matches === 0) {
      failures.push(`${fileName}: nothing matched for "${fix.description}"`);
      continue;
    }

    source = source.replace(fix.pattern, fix.replacement);
    console.log(`${fileName}: fixed ${matches} × ${fix.description}`);
  }

  if (failures.length === 0) {
    writeFileSync(path, source);
  }

  return failures;
}

const failures = [
  ...applyFixes('schema.ts', SCHEMA_FIXES),
  ...applyFixes('relations.ts', RELATIONS_FIXES),
];

if (failures.length > 0) {
  console.error(
    'drizzle-kit pull output changed, review it and update scripts/fix-pulled-schema.ts:',
  );
  for (const failure of failures) {
    console.error(`  ${failure}`);
  }
  process.exit(1);
}
