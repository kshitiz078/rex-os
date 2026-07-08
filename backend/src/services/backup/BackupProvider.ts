export interface BackupSnapshot {
  version: number;
  createdAt: string;
  data: Record<string, unknown>;
}

export interface BackupProvider {
  name: string;
  backup(snapshot: BackupSnapshot): Promise<{ backupId: string; completedAt: string }>;
  restoreLatest(): Promise<BackupSnapshot>;
}
