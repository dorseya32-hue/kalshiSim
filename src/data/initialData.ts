import { Market, UserProfile, ActivityEvent } from '../types/market';

export const INITIAL_USERS: Record<string, UserProfile> = {};

export const INITIAL_MARKETS: Record<string, Market> = {
  'mkt_swe_bench': {
    id: 'mkt_swe_bench',
    question: 'Will a foundation AI model achieve a score > 95% on SWE-bench Verified before Dec 2026?',
    description: 'Resolves YES if any verified laboratory or public benchmark entry on SWE-bench Verified scores strictly above 95.0% on full-test evaluation with published methodology before December 31, 2026.',
    category: 'Tech & AI',
    closesAt: '2026-12-31T23:59:00Z',
    createdAt: '2026-02-01T10:00:00Z',
    status: 'open',
    outcome: null,
    createdBy: 'admin',
    createdByName: 'Admin',
    positions: {},
    comments: []
  },
  'mkt_starship_orbital': {
    id: 'mkt_starship_orbital',
    question: 'Will SpaceX Starship successfully deploy customer orbital payloads in 2026?',
    description: 'Resolves YES if SpaceX Starship performs a commercial or government payload deployment into low Earth orbit (or higher) with confirmed separation and operational deployment reported by official telemetry.',
    category: 'Science & Space',
    closesAt: '2026-11-30T18:00:00Z',
    createdAt: '2026-01-18T12:00:00Z',
    status: 'open',
    outcome: null,
    createdBy: 'admin',
    createdByName: 'Admin',
    positions: {},
    comments: []
  },
  'mkt_robotaxi_cities': {
    id: 'mkt_robotaxi_cities',
    question: 'Will commercial driverless robotaxis operate in at least 15 US metro areas by end of 2026?',
    description: 'Requires fully autonomous (no safety driver behind steering wheel) commercial passenger ride-hailing services available to the general public in at least 15 distinct metropolitan statistical areas in the United States.',
    category: 'Tech & AI',
    closesAt: '2026-12-31T20:00:00Z',
    createdAt: '2026-01-25T15:00:00Z',
    status: 'open',
    outcome: null,
    createdBy: 'admin',
    createdByName: 'Admin',
    positions: {},
    comments: []
  },
  'mkt_clean_energy_40': {
    id: 'mkt_clean_energy_40',
    question: 'Will global clean energy generation surpass 40% of total worldwide electricity in 2026?',
    description: 'Resolves YES if Ember or International Energy Agency (IEA) official reports record renewables + nuclear exceeding 40.0% of total global electricity output for the calendar year.',
    category: 'Science & Space',
    closesAt: '2026-12-15T23:59:00Z',
    createdAt: '2026-02-10T08:00:00Z',
    status: 'open',
    outcome: null,
    createdBy: 'admin',
    createdByName: 'Admin',
    positions: {},
    comments: []
  },
  'mkt_interest_rates_cut': {
    id: 'mkt_interest_rates_cut',
    question: 'Will the US Federal Funds target rate upper limit be lowered to <= 3.75% before Nov 2026?',
    description: 'Resolves according to the Federal Reserve Federal Open Market Committee (FOMC) published policy rate target announcement on or before November 1, 2026.',
    category: 'Crypto & Finance',
    closesAt: '2026-11-01T18:00:00Z',
    createdAt: '2026-02-03T11:00:00Z',
    status: 'open',
    outcome: null,
    createdBy: 'admin',
    createdByName: 'Admin',
    positions: {},
    comments: []
  }
};

export const INITIAL_ACTIVITY: ActivityEvent[] = [];
