import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { userRouter } from "~/server/api/routers/user";
import { propertiesRouter } from "~/server/api/routers/properties";
import { contractsRouter } from "~/server/api/routers/contracts";
import { invoicesRouter } from "~/server/api/routers/invoices";
import { paymentsRouter } from "~/server/api/routers/payments";
import { adminRouter } from "~/server/api/routers/admin";
import { guestRouter } from "~/server/api/routers/guest";

export const appRouter = createTRPCRouter({
  user: userRouter,
  properties: propertiesRouter,
  contracts: contractsRouter,
  invoices: invoicesRouter,
  payments: paymentsRouter,
  admin: adminRouter,
  guest: guestRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
