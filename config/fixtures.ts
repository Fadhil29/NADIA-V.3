import { BrowserContext, expect, Page, test as base } from '@playwright/test';
import { ActorName, authFile, resolveRole, RoleSlug } from './roles';
import { watchDialogs } from '../pages/nadia-shell';

type Fixtures = { as: (actor: ActorName) => Promise<Page> };

// EVIDENCE=1 (npm run test:evidence): setiap page role direkam video, dilampirkan sebagai "video-<role>"
const REKAM = !!process.env.EVIDENCE;

export const test = base.extend<Fixtures>({
  as: async ({ browser }, use, testInfo) => {
    const pages = new Map<RoleSlug, Page>();
    const contexts: BrowserContext[] = [];

    await use(async (actor) => {
      const role = resolveRole(actor); // alias (atasan -> divhead) berbagi satu page
      const opened = pages.get(role);
      if (opened) return opened;
      const context = await browser.newContext({
        storageState: authFile(role),
        ...(REKAM ? { recordVideo: { dir: testInfo.outputPath('video'), size: { width: 1280, height: 720 } } } : {}),
      });
      contexts.push(context);
      const page = await context.newPage();
      watchDialogs(page);
      pages.set(role, page);
      return page;
    });

    const videos = REKAM ? [...pages].map(([role, page]) => ({ role, video: page.video() })) : [];
    await Promise.all(contexts.map((c) => c.close())); // video baru selesai ditulis setelah context ditutup
    for (const { role, video } of videos) {
      if (video) await testInfo.attach(`video-${role}`, { path: await video.path(), contentType: 'video/webm' });
    }
  },
});

export { expect };
