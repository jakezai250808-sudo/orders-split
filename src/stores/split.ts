import { defineStore } from 'pinia';
import type { RuleResult } from '@/api/contracts';

export const useSplitStore = defineStore('split', {
  state: () => ({
    selectedNodeId: '' as string,
    selectedPanelId: '' as string,
    ruleResults: [] as RuleResult[],
    hasMissingParams: true,
    hasFailedRules: true
  }),
  getters: {
    canGenerate: (s) => !s.hasMissingParams && !s.hasFailedRules
  },
  actions: {
    setRuleResults(results: RuleResult[]) {
      this.ruleResults = results;
      this.hasFailedRules = results.some((r) => r.level === 'fail');
    }
  }
});
