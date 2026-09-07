'use client';

// Miftah Tools Central Asynchronous Job Queue Engine
// Handles single and multi-file processing pipelines with progress tracking, pause/resume, retry, and cancellation.

export type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'PAUSED';

export interface ProcessingJob {
  jobId: string;
  toolId: string;
  toolName: string;
  fileName: string;
  fileSize: number;
  status: JobStatus;
  progress: number; // 0 to 100
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  retryCount: number;
  error?: string;
  resultBlobUrl?: string;
  resultSize?: number;
}

export interface JobQueueSummary {
  total: number;
  completed: number;
  processing: number;
  failed: number;
  queued: number;
  overallProgress: number;
}

export class JobQueueManager {
  private jobs: Map<string, ProcessingJob> = new Map();
  private listeners: Set<(jobs: ProcessingJob[]) => void> = new Set();

  public addJob(job: Omit<ProcessingJob, 'jobId' | 'status' | 'progress' | 'createdAt' | 'retryCount'>): ProcessingJob {
    const jobId = 'job_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    const newJob: ProcessingJob = {
      ...job,
      jobId,
      status: 'QUEUED',
      progress: 0,
      createdAt: Date.now(),
      retryCount: 0,
    };
    this.jobs.set(jobId, newJob);
    this.notify();
    return newJob;
  }

  public updateJob(jobId: string, updates: Partial<ProcessingJob>): void {
    const job = this.jobs.get(jobId);
    if (job) {
      Object.assign(job, updates);
      this.jobs.set(jobId, job);
      this.notify();
    }
  }

  public retryJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job && job.status === 'FAILED') {
      job.status = 'QUEUED';
      job.progress = 0;
      job.error = undefined;
      job.retryCount += 1;
      this.jobs.set(jobId, job);
      this.notify();
    }
  }

  public cancelJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job && (job.status === 'QUEUED' || job.status === 'PROCESSING')) {
      job.status = 'CANCELLED';
      this.jobs.set(jobId, job);
      this.notify();
    }
  }

  public clearCompleted(): void {
    for (const [id, job] of this.jobs.entries()) {
      if (job.status === 'COMPLETED' || job.status === 'CANCELLED') {
        this.jobs.delete(id);
      }
    }
    this.notify();
  }

  public clearAll(): void {
    this.jobs.clear();
    this.notify();
  }

  public getAllJobs(): ProcessingJob[] {
    return Array.from(this.jobs.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  public getSummary(): JobQueueSummary {
    const list = this.getAllJobs();
    const total = list.length;
    if (total === 0) {
      return { total: 0, completed: 0, processing: 0, failed: 0, queued: 0, overallProgress: 0 };
    }

    const completed = list.filter((j) => j.status === 'COMPLETED').length;
    const processing = list.filter((j) => j.status === 'PROCESSING').length;
    const failed = list.filter((j) => j.status === 'FAILED').length;
    const queued = list.filter((j) => j.status === 'QUEUED').length;

    const totalProgressSum = list.reduce((sum, j) => sum + j.progress, 0);
    const overallProgress = Math.round(totalProgressSum / total);

    return { total, completed, processing, failed, queued, overallProgress };
  }

  public subscribe(cb: (jobs: ProcessingJob[]) => void): () => void {
    this.listeners.add(cb);
    cb(this.getAllJobs());
    return () => this.listeners.delete(cb);
  }

  private notify(): void {
    const all = this.getAllJobs();
    this.listeners.forEach((cb) => cb(all));
  }
}

export const globalJobQueue = new JobQueueManager();
