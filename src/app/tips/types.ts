export interface GuideCriterion {
  keyPhrase: string
  upgradeTo6?: string[]
  upgradeTo7?: string[]
  upgradeTo8?: string[]
  upgradeTo9?: string[]
  maintain?: string[]
}

export interface GuideBand {
  summary: string
  criteria: Record<string, GuideCriterion>
}

export interface GuideTipBundle {
  id: string
  label: string
  taskTarget?: string
  bandTarget: string
  tips: string[]
}

export interface GuideTask {
  id: string
  label: string
  bands: Record<string, GuideBand>
  tipBundles: GuideTipBundle[]
}

export interface GuideData {
  tasks: GuideTask[]
}

