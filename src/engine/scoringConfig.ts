// טוען ובודק את קובץ הספים config/scoring.json.
// אם הקובץ שבור (למשל משקלים שלא מסתכמים ל-1), בדיקות היחידה נכשלות לפני שזה מגיע למסך.
// מתי נוגעים: כשמוסיפים סוג כלל חדש לקובץ הספים.
import { z } from 'zod';
import raw from '../../config/scoring.json';
import { ActivityId } from '../types';

export const SCORED_PARAMS = ['waveHeight', 'windSpeed', 'airTemperature', 'waterTemperature'] as const;
export type ScoredParam = (typeof SCORED_PARAMS)[number];

const RangeSchema = z.object({ min: z.number().optional(), max: z.number().optional() });
export type Range = z.infer<typeof RangeSchema>;

const ParamRuleSchema = z.object({ weight: z.number().gt(0).lte(1), comfortable: RangeSchema, acceptable: RangeSchema });
export type ParamRule = z.infer<typeof ParamRuleSchema>;

const ActivityRulesSchema = z.partialRecord(z.enum(SCORED_PARAMS), ParamRuleSchema);
const hhmm = z.string().regex(/^([01]\d|2[0-3]):00$/);

export const ScoringConfigSchema = z.object({
  version: z.string(),
  calibrated: z.boolean(),
  points: z.object({ comfortable: z.number(), acceptable: z.number(), uncomfortable: z.number() }),
  cap: z.object({ minWeight: z.number(), maxScore: z.number() }),
  rain: z.object({ above: z.number(), penalty: z.number() }),
  status: z.object({ excellent: z.number(), good: z.number(), fair: z.number() }),
  window: z.object({ from: hhmm, to: hhmm, minHours: z.number().int().min(1), maxHours: z.number().int().min(1), minScore: z.number() }),
  activities: z.object({
    beach: ActivityRulesSchema, swim: ActivityRulesSchema, kids: ActivityRulesSchema,
    surf: ActivityRulesSchema, sup: ActivityRulesSchema, sail: ActivityRulesSchema,
  }),
});
export type ScoringConfig = z.infer<typeof ScoringConfigSchema>;

export const SCORING: ScoringConfig = ScoringConfigSchema.parse(raw);

export function rulesFor(activity: ActivityId): [ScoredParam, ParamRule][] {
  return Object.entries(SCORING.activities[activity]) as [ScoredParam, ParamRule][];
}
