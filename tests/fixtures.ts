import { BrowserContext, expect, Page, test as base } from '@playwright/test';
import { ActorName, authFile, resolveRole, RoleSlug } from '../scripts/roles';
import { watchDialogs } from './helpers/nav';

type Fixtures = { as: (actor: ActorName) => Promise<Page> };

export const test = base.extend<Fixtures>({
  as: async ({ browser }, use) => {
    const pages = new Map<RoleSlug, Page>();
    const contexts: BrowserContext[] = [];

    await use(async (actor) => {
      const role = resolveRole(actor); // alias (atasan -> divhead) berbagi satu page
      const opened = pages.get(role);
      if (opened) return opened;
      const context = await browser.newContext({ storageState: authFile(role) });
      contexts.push(context);
      const page = await context.newPage();
      watchDialogs(page);
      pages.set(role, page);
      return page;
    });

    await Promise.all(contexts.map((c) => c.close()));
  },
});

export { expect };
