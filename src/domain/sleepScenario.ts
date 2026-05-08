export interface SleepScenarioRecord {
  readonly startDate?: string;
  readonly endDate?: string;
  readonly value?: string;
  readonly device?: string;
  readonly sourceName?: string;
  readonly sourceVersion?: string;
  readonly creationDate?: string;
  readonly extraAttributes?: Readonly<Record<string, string>>;
}

interface SleepScenarioBase {
  readonly id: string;
  readonly description: string;
  readonly records: readonly SleepScenarioRecord[];
}

export interface SleepScenarioSuccess extends SleepScenarioBase {
  readonly expectedOutcome: "success";
  readonly expectedError?: never;
}

export interface SleepScenarioFailure extends SleepScenarioBase {
  readonly expectedOutcome: "failure";
  readonly expectedError: string;
}

export type SleepScenario = SleepScenarioSuccess | SleepScenarioFailure;
