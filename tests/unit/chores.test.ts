import { describe, expect, it } from 'vitest';
import { choreSchema, type ChoreData } from '../../src/lib/chore-schema';
import { toChoreViews } from '../../src/lib/chores';

const valid = {
  order: 1,
  skill: 'presence',
  from: { zh: '出門回家要開關冷氣燈光', en: 'Turning the AC and lights on and off' },
  to: { zh: '說「我出門了」就全部處理好', en: "Say \"heading out\" and it's handled" },
  chat: [
    { who: 'me', zh: '我要出門了', en: 'Heading out' },
    { who: 'tool', items: { zh: ['關燈'], en: ['Lights off'] } },
    { who: 'agent', zh: '路上小心', en: 'Have a good one' },
  ],
};

describe('choreSchema', () => {
  it('accepts a valid chore', () => {
    expect(choreSchema.safeParse(valid).success).toBe(true);
  });
  it('accepts a chore without skill or link', () => {
    const { skill, ...rest } = valid;
    expect(choreSchema.safeParse(rest).success).toBe(true);
  });
  it('rejects a missing translation', () => {
    expect(choreSchema.safeParse({ ...valid, from: { zh: '只有中文' } }).success).toBe(false);
  });
  it('rejects blank text', () => {
    expect(choreSchema.safeParse({ ...valid, to: { zh: '  ', en: 'x' } }).success).toBe(false);
  });
  it('rejects fewer than 2 chat lines', () => {
    expect(choreSchema.safeParse({ ...valid, chat: [valid.chat[0]] }).success).toBe(false);
  });
  it('rejects more than 4 chat lines', () => {
    expect(choreSchema.safeParse({ ...valid, chat: [...valid.chat, ...valid.chat] }).success).toBe(false);
  });
  it('rejects an unknown speaker', () => {
    expect(choreSchema.safeParse({ ...valid, chat: [valid.chat[0], { who: 'cat', zh: '喵', en: 'meow' }] }).success).toBe(false);
  });
  it('rejects a tool line with no items', () => {
    expect(choreSchema.safeParse({ ...valid, chat: [valid.chat[0], { who: 'tool', items: { zh: [], en: [] } }] }).success).toBe(false);
  });
  it('rejects a non-URL link', () => {
    expect(choreSchema.safeParse({ ...valid, link: 'not a url' }).success).toBe(false);
  });
  it.each(['javascript:alert(1)', 'data:text/html,hi', 'ftp://example.com', 'http://example.com'])(
    'rejects a non-https link: %s',
    (link) => {
      expect(choreSchema.safeParse({ ...valid, link }).success).toBe(false);
    },
  );
  it('accepts an https link', () => {
    expect(choreSchema.safeParse({ ...valid, link: 'https://github.com/SmallYuanSY' }).success).toBe(true);
  });
  it('rejects a skill name with spaces or capitals', () => {
    expect(choreSchema.safeParse({ ...valid, skill: 'Mac Weather' }).success).toBe(false);
  });
});

const entry = (id: string, order: number, extra: Partial<ChoreData> = {}) => ({
  id,
  data: choreSchema.parse({ ...valid, order, ...extra }),
});

describe('toChoreViews', () => {
  it('sorts by order', () => {
    const views = toChoreViews([entry('b', 2), entry('a', 1)], 'zh', '作品');
    expect(views.map((v) => v.id)).toEqual(['a', 'b']);
  });

  it('breaks order ties by id so output is stable', () => {
    const views = toChoreViews([entry('zeta', 1), entry('alpha', 1), entry('mid', 1)], 'zh', '作品');
    expect(views.map((v) => v.id)).toEqual(['alpha', 'mid', 'zeta']);
  });

  it('localizes text and chat', () => {
    const [v] = toChoreViews([entry('a', 1)], 'en', 'project');
    expect(v.from).toBe('Turning the AC and lights on and off');
    expect(v.chat).toEqual([
      { who: 'me', text: 'Heading out' },
      { who: 'tool', items: ['Lights off'] },
      { who: 'agent', text: 'Have a good one' },
    ]);
  });

  it('uses the skill as chip, else the project label', () => {
    const { skill, ...noSkill } = valid;
    const views = toChoreViews(
      [entry('a', 1), { id: 'b', data: choreSchema.parse({ ...noSkill, order: 2 }) }],
      'zh',
      '作品',
    );
    expect(views.map((v) => v.chip)).toEqual(['presence', '作品']);
  });

  it('passes the link through only when present', () => {
    const views = toChoreViews([entry('a', 1, { link: 'https://github.com/SmallYuanSY' }), entry('b', 2)], 'zh', '作品');
    expect(views[0].link).toBe('https://github.com/SmallYuanSY');
    expect(views[1].link).toBeUndefined();
  });

  it('returns an empty list for no entries', () => {
    expect(toChoreViews([], 'zh', '作品')).toEqual([]);
  });
});
