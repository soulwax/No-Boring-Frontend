import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ChaosApi } from '../core/chaos-api';
import { AudioFxService } from '../core/audio-fx';
import { QuestOverview, Thing } from '../core/models';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-quests',
  imports: [Icon, DatePipe],
  templateUrl: './quests.html',
  styleUrl: './quests.scss',
})
export class QuestsComponent {
  private readonly api = inject(ChaosApi);
  private readonly audio = inject(AudioFxService);

  readonly overview = signal<QuestOverview | null>(null);
  readonly loading = signal(true);
  readonly copied = signal(false);

  readonly xpPercentage = computed(() => {
    const o = this.overview();
    if (!o) return 0;
    const currentInLevel = o.slayerXp % 200;
    return Math.min(100, (currentInLevel / 200) * 100);
  });

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.api.getQuests().subscribe({
      next: (data) => {
        this.overview.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  slay(id: number): void {
    this.audio.playSlayTask();
    this.api.slay(id).subscribe({
      next: () => this.refresh(),
    });
  }

  downloadIcs(id: number): void {
    this.api.downloadIcs(id);
  }

  copyMarkdown(): void {
    const o = this.overview();
    if (!o) return;

    let md = `# ⚔️ Chore Slayer Quest Log\n\n`;
    md += `**Slayer Level ${o.slayerLevel}** | ${o.slayerXp} XP | ${o.slayedCount} Chores Conquered\n\n`;
    md += `## Active Quests\n\n`;

    if (o.myActiveQuests.length === 0) {
      md += `*No active quests right now! Go slay some boredom on the board.*\n\n`;
    } else {
      o.myActiveQuests.forEach((q) => {
        md += `### [ ] ${q.original} (${q.estimatedMinutes || 15}m)\n`;
        md += `*${q.twist}*\n\n`;
        if (q.questSteps && q.questSteps.length > 0) {
          md += `**Micro-steps:**\n`;
          q.questSteps.forEach((s) => {
            md += `- [ ] ${s}\n`;
          });
          md += `\n`;
        }
      });
    }

    if (o.mySlayedQuests.length > 0) {
      md += `## Hall of Conquered Chores\n\n`;
      o.mySlayedQuests.forEach((q) => {
        md += `- [x] **${q.original}** — *${q.twist}*\n`;
      });
    }

    navigator.clipboard.writeText(md).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2500);
    });
  }
}
