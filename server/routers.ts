import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createTeam,
  getTeamByCode,
  getTeamById,
  getTeamsByOwner,
  updateTeamSettings,
  saveAssessment,
  getAssessmentsByTeam,
  getAssessmentsByUser,
  getAssessmentByShareToken,
  getAssessmentByEmail,
  getAssessmentById,
  getOrCreateTeamByDomain,
  getAssessmentsByDomain,
  saveFeedback,
  getFeedbackByTeam,
  sendSlackNotification,
  createEmailVerification,
  verifyEmailCode,
  isEmailVerified,
  createPeerReviewInvite,
  getPeerReviewByToken,
  completePeerReview,
  getPeerReviewsByAssessment,
  createEmailDrip,
  getPendingDrips,
  markDripSent,
  unsubscribeDrip,
  getAdminStats,
  getNormingData,
  getPercentileForScore,
  getTeamComparisonData,
  submitTestimonial,
  getApprovedTestimonials,
  getPendingTestimonials,
  approveTestimonial,
  saveCalibrationResult,
  getCalibrationByAssessment,
  getResearchStats,
  updateResearchOptIn,
  saveSoulprintProfile,
  getSoulprintByAssessment,
  toggleSoulprintEnabled,
  toggleSoulprintTeamView,
  setSoulprintConsent,
  adminToggleSoulprint,
  getTeamSoulprints,
  getAllAssessments,
  getDistinctDomains,
  getTeamWithAffiliates,
  addTeamAffiliation,
  removeTeamAffiliation,
  create360Session,
  get360SessionByToken,
  get360SessionByAssessmentId,
  submit360Response,
  get360Responses,
  get360ResponseCount,
  calculate360GapReport,
  createTribeTrial,
  getTrialByEmail,
  getActiveTrialByEmail,
} from "./db";
import { TRPCError } from "@trpc/server";
import { ENV } from "./_core/env";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  team: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        companyName: z.string().max(255).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const team = await createTeam(ctx.user.id, input.name, input.companyName);
        return team;
      }),

    myTeams: protectedProcedure.query(async ({ ctx }) => {
      return getTeamsByOwner(ctx.user.id);
    }),

    getByCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        const team = await getTeamByCode(input.code);
        if (!team) return null;
        return { id: team.id, name: team.name, code: team.code, logoUrl: team.logoUrl, companyName: team.companyName, maxMembers: team.maxMembers };
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const team = await getTeamById(input.id);
        if (!team || team.ownerId !== ctx.user.id) return null;
        return team;
      }),

    updateSettings: protectedProcedure
      .input(z.object({
        teamId: z.number(),
        name: z.string().min(1).max(255).optional(),
        companyName: z.string().max(255).nullable().optional(),
        logoUrl: z.string().nullable().optional(),
        slackWebhookUrl: z.string().nullable().optional(),
        weeklyReportEnabled: z.boolean().optional(),
        weeklyReportEmail: z.string().email().nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const team = await getTeamById(input.teamId);
        if (!team || team.ownerId !== ctx.user.id) {
          throw new Error("Team not found or unauthorized");
        }
        await updateTeamSettings(input.teamId, {
          name: input.name,
          companyName: input.companyName,
          logoUrl: input.logoUrl,
          slackWebhookUrl: input.slackWebhookUrl,
          weeklyReportEnabled: input.weeklyReportEnabled,
          weeklyReportEmail: input.weeklyReportEmail,
        });
        return { success: true };
      }),

    uploadLogo: protectedProcedure
      .input(z.object({
        teamId: z.number(),
        fileName: z.string(),
        base64Data: z.string(),
        contentType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const team = await getTeamById(input.teamId);
        if (!team || team.ownerId !== ctx.user.id) {
          throw new Error("Team not found or unauthorized");
        }
        const { storagePut } = await import("./storage");
        const buffer = Buffer.from(input.base64Data, "base64");
        const fileKey = `team-logos/${input.teamId}-${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.contentType);
        await updateTeamSettings(input.teamId, { logoUrl: url });
        return { url };
      }),

    updateSlack: protectedProcedure
      .input(z.object({
        teamId: z.number(),
        webhookUrl: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const team = await getTeamById(input.teamId);
        if (!team || team.ownerId !== ctx.user.id) {
          throw new Error("Team not found or unauthorized");
        }
        await updateTeamSettings(input.teamId, {
          slackWebhookUrl: input.webhookUrl || null,
        });
        return { success: true };
      }),

    members: protectedProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ ctx, input }) => {
        const team = await getTeamById(input.teamId);
        if (!team || team.ownerId !== ctx.user.id) return [];
        return getAssessmentsByTeam(input.teamId);
      }),

    memberCount: publicProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ input }) => {
        const members = await getAssessmentsByTeam(input.teamId);
        return { count: members.length };
      }),
  }),

  assessment: router({
    submit: publicProcedure
      .input(z.object({
        teamCode: z.string().optional(),
        domain: z.string().optional(),
        guestName: z.string().min(1).max(255),
        guestEmail: z.string().email().optional(),
        role: z.string().min(1),
        score: z.number(),
        scores: z.any().optional(),
        answers: z.any().optional(),
        birthDate: z.string().optional(),
        birthTime: z.string().optional(),
        birthCity: z.string().optional(),
        researchOptIn: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        let teamId: number | undefined;
        let team = null;
        let domainNormalized: string | null = null;

        // Domain-based team join: auto-create or find team by domain
        if (input.domain) {
          domainNormalized = input.domain.toLowerCase().trim();
          team = await getOrCreateTeamByDomain(domainNormalized);
          if (team) {
            const existing = await getAssessmentsByTeam(team.id);
            if (team.maxMembers && existing.length >= team.maxMembers) {
              throw new Error(`This team has reached its maximum of ${team.maxMembers} members.`);
            }
            teamId = team.id;
          }
        } else if (input.teamCode) {
          team = await getTeamByCode(input.teamCode);
          if (team) {
            // Check member cap
            const existing = await getAssessmentsByTeam(team.id);
            if (team.maxMembers && existing.length >= team.maxMembers) {
              throw new Error(`This team has reached its maximum of ${team.maxMembers} members.`);
            }
            teamId = team.id;
          }
        }

        // Generate a share token for this assessment
        const shareToken = crypto.randomUUID().replace(/-/g, "").slice(0, 16);

        const assessment = await saveAssessment({
          userId: ctx.user?.id ?? null,
          teamId: teamId ?? null,
          guestName: input.guestName,
          guestEmail: input.guestEmail ?? null,
          domain: domainNormalized,
          role: input.role,
          score: input.score,
          scores: input.scores ?? null,
          answers: input.answers ?? null,
          birthDate: input.birthDate ?? null,
          birthTime: input.birthTime ?? null,
          birthCity: input.birthCity ?? null,
          shareToken,
          isPublic: false,
          researchOptIn: input.researchOptIn ?? false,
        });

        // Send Slack notification if team has a webhook configured
        if (team?.slackWebhookUrl) {
          await sendSlackNotification(team.slackWebhookUrl, {
            text: `New Flow Circuit Assessment Completed!`,
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `*New Assessment Result* :zap:\n*Name:* ${input.guestName}\n*Role:* ${input.role}\n*Score:* ${input.score}%\n*Team:* ${team.name}`,
                },
              },
            ],
          });
        }

        // Fire-and-forget: auto-generate PDF, notify owner, check team friction report
        if (assessment) {
          import("./postAssessmentAutomation").then(({ runPostAssessmentAutomation }) => {
            runPostAssessmentAutomation({
              id: assessment!.id,
              guestName: assessment!.guestName || input.guestName,
              guestEmail: assessment!.guestEmail || input.guestEmail || null,
              domain: domainNormalized,
              role: assessment!.role || input.role,
              score: assessment!.score ?? input.score,
              scores: (assessment!.scores as Record<string, number>) || input.scores || {},
              shareToken: assessment!.shareToken || null,
              teamId: assessment!.teamId || null,
            }).catch(err => console.error("[PostAssessment] Automation failed:", err));
          }).catch(err => console.error("[PostAssessment] Import failed:", err));
        }

        return assessment;
      }),

    getByShareToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        return getAssessmentByShareToken(input.token);
      }),

    getByEmail: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        return getAssessmentByEmail(input.email);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getAssessmentById(input.id);
      }),

    togglePublic: publicProcedure
      .input(z.object({ assessmentId: z.number(), isPublic: z.boolean() }))
      .mutation(async ({ input }) => {
        // Simple toggle — in production you'd verify ownership
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) return { success: false };
        const { assessments } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await db.update(assessments).set({ isPublic: input.isPublic }).where(eq(assessments.id, input.assessmentId));
        return { success: true };
      }),

    myResults: protectedProcedure.query(async ({ ctx }) => {
      return getAssessmentsByUser(ctx.user.id);
    }),

    byDomain: publicProcedure
      .input(z.object({ domain: z.string().min(1) }))
      .query(async ({ input }) => {
        return getAssessmentsByDomain(input.domain);
      }),

    teamWithAffiliates: publicProcedure
      .input(z.object({ domain: z.string().min(1) }))
      .query(async ({ input }) => {
        return getTeamWithAffiliates(input.domain);
      }),

    teamResults: protectedProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ ctx, input }) => {
        const team = await getTeamById(input.teamId);
        if (!team || team.ownerId !== ctx.user.id) return [];
        return getAssessmentsByTeam(input.teamId);
      }),

    saveCalibration: protectedProcedure
      .input(z.object({
        assessmentId: z.number(),
        rankings: z.any(),
        calibratedScores: z.any(),
        calibratedRole: z.string(),
        originalScores: z.any(),
        originalRole: z.string(),
        confidenceScore: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await saveCalibrationResult({
          assessmentId: input.assessmentId,
          userId: ctx.user.id,
          rankings: input.rankings,
          calibratedScores: input.calibratedScores,
          calibratedRole: input.calibratedRole,
          originalScores: input.originalScores,
          originalRole: input.originalRole,
          confidenceScore: input.confidenceScore,
        });
        return result;
      }),

    getCalibration: protectedProcedure
      .input(z.object({ assessmentId: z.number() }))
      .query(async ({ input }) => {
        return getCalibrationByAssessment(input.assessmentId);
      }),

    updateResearchOptIn: publicProcedure
      .input(z.object({ assessmentId: z.number(), optIn: z.boolean() }))
      .mutation(async ({ input }) => {
        return updateResearchOptIn(input.assessmentId, input.optIn);
      }),

    researchStats: publicProcedure.query(async () => {
      return getResearchStats();
    }),

    generateReport: publicProcedure
      .input(z.object({
        assessmentId: z.number(),
        origin: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Look up the assessment by ID directly
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const { assessments } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const [found] = await db.select().from(assessments).where(eq(assessments.id, input.assessmentId)).limit(1);
        if (!found) throw new TRPCError({ code: "NOT_FOUND", message: "Assessment not found" });

        const { generateAssessmentPDF } = await import("./pdfReport");
        const scores = (found.scores as Record<string, number>) || {};
        const result = await generateAssessmentPDF({
          name: found.guestName || "Anonymous",
          email: found.guestEmail || undefined,
          role: found.role,
          score: found.score ?? 0,
          scores,
          shareToken: found.shareToken || undefined,
          assessmentId: found.id,
          origin: input.origin,
        });
        return { url: result.url, key: result.key };
      }),
  }),

  emailVerification: router({
    // Request a verification code — called after assessment submission
    request: publicProcedure
      .input(z.object({
        email: z.string().email(),
        assessmentId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const verification = await createEmailVerification(input.email, input.assessmentId);
        if (!verification) {
          throw new Error("Failed to create verification. Please try again.");
        }
        // In production, send email with the code. For now, the code is stored in DB
        // and we notify the owner about the new signup
        const { notifyOwner } = await import("./_core/notification");
        await notifyOwner({
          title: `New Assessment: Verification Code for ${input.email}`,
          content: `Verification code: ${verification.code}\nEmail: ${input.email}\nAssessment ID: ${input.assessmentId}`,
        });
        return { success: true, message: "Verification code sent to your email." };
      }),

    // Verify the code
    verify: publicProcedure
      .input(z.object({
        email: z.string().email(),
        code: z.string().length(6),
      }))
      .mutation(async ({ input }) => {
        const verified = await verifyEmailCode(input.email, input.code);
        if (!verified) {
          throw new Error("Invalid or expired verification code.");
        }
        return { success: true };
      }),

    // Check if an email is verified
    check: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        const verified = await isEmailVerified(input.email);
        return { verified };
      }),
  }),

  peerReview: router({
    // Create 360 invite links — called after assessment completion
    createInvites: publicProcedure
      .input(z.object({
        assessmentId: z.number(),
        targetName: z.string().min(1),
        reviewerEmails: z.array(z.string().email()).min(1).max(10),
        origin: z.string(), // Frontend origin for building invite URLs
      }))
      .mutation(async ({ input }) => {
        const invites = [];
        for (const email of input.reviewerEmails) {
          const invite = await createPeerReviewInvite(
            input.assessmentId,
            input.targetName,
            email
          );
          if (invite) {
            invites.push({
              email,
              inviteUrl: `${input.origin}/peer-review/${invite.inviteToken}`,
              token: invite.inviteToken,
            });
          }
        }
        return { invites };
      }),

    // Get a peer review invite by token (for the reviewer to see who they're reviewing)
    getByToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const review = await getPeerReviewByToken(input.token);
        if (!review) return null;
        return {
          id: review.id,
          targetName: review.targetName,
          completed: review.completed,
          inviteToken: review.inviteToken,
        };
      }),

    // Complete a peer review
    complete: publicProcedure
      .input(z.object({
        token: z.string(),
        reviewerName: z.string().min(1),
        perceivedRole: z.string().min(1),
        perceivedScores: z.any(),
        answers: z.any(),
      }))
      .mutation(async ({ input }) => {
        const success = await completePeerReview(
          input.token,
          input.reviewerName,
          input.perceivedRole,
          input.perceivedScores,
          input.answers
        );
        if (!success) {
          throw new Error("Review not found or already completed.");
        }
        return { success: true };
      }),

    // Get all peer reviews for an assessment
    byAssessment: publicProcedure
      .input(z.object({ assessmentId: z.number() }))
      .query(async ({ input }) => {
        return getPeerReviewsByAssessment(input.assessmentId);
      }),
  }),

  // ─── Stripe Payments ───────────────────────────────────────────────
  stripe: router({
    // Create checkout session for Tribe plan
    createCheckout: protectedProcedure
      .input(z.object({
        origin: z.string(),
        teamSize: z.number().min(1).max(100).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createCheckoutSession } = await import("./stripe/stripe");
        const result = await createCheckoutSession({
          userId: ctx.user.id,
          email: ctx.user.email || "",
          name: ctx.user.name || "",
          origin: input.origin,
          teamSize: input.teamSize,
        });
        return result;
      }),

    // Get subscription status
    status: protectedProcedure.query(async ({ ctx }) => {
      const { getSubscriptionStatus } = await import("./stripe/stripe");
      return getSubscriptionStatus(ctx.user.id);
    }),

    // Create customer portal session for managing subscription
    createPortal: protectedProcedure
      .input(z.object({ origin: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { createPortalSession } = await import("./stripe/stripe");
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const { users } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const [user] = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);

        if (!user?.stripeCustomerId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "No active subscription found." });
        }

        return createPortalSession({
          customerId: user.stripeCustomerId,
          origin: input.origin,
        });
      }),
  }),

  // ─── Soulprint Integration ─────────────────────────────────────────
  soulprint: router({
    // Check if soulprint data exists for an assessment
    status: publicProcedure
      .input(z.object({ assessmentId: z.number() }))
      .query(async ({ input }) => {
        const { getSoulprintOrderByAssessment } = await import("./db");
        const order = await getSoulprintOrderByAssessment(input.assessmentId);
        if (!order) {
          return {
            available: false,
            status: 'none' as const,
            message: 'No SoulPrint order found for this assessment.',
          };
        }
        return {
          available: order.soulprintStatus === 'completed',
          status: order.soulprintStatus as string,
          message: order.soulprintStatus === 'completed'
            ? 'Your SoulPrint report is ready.'
            : 'Your SoulPrint is being generated. We\'ll notify you when it\'s ready.',
          orderId: order.id,
        };
      }),

    // Get alpha count (how many free orders have been created)
    alphaCount: publicProcedure.query(async () => {
      const { getSoulprintAlphaCount } = await import("./db");
      const count = await getSoulprintAlphaCount();
      return { count };
    }),

    // Create a SoulPrint order (free for alpha, Stripe checkout after)
    createOrder: publicProcedure
      .input(z.object({
        tier: z.enum(['blueprint', 'compass', 'oracle']),
        reportType: z.enum(['soulprint_only', 'combined']),
        birthDate: z.string().min(1),
        birthTime: z.string().optional(),
        birthCity: z.string().min(1),
        name: z.string().optional(),
        email: z.string().email().optional(),
        assessmentId: z.number().optional(),
        origin: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createSoulprintOrder, getSoulprintAlphaCount } = await import("./db");
        const alphaCount = await getSoulprintAlphaCount();
        const isAlphaEligible = alphaCount < 1000;

        const order = await createSoulprintOrder({
          userId: ctx.user?.id ?? null,
          assessmentId: input.assessmentId ?? null,
          guestName: input.name ?? null,
          guestEmail: input.email ?? null,
          birthDate: input.birthDate,
          birthTime: input.birthTime ?? null,
          birthCity: input.birthCity,
          tier: input.tier,
          reportType: input.reportType,
          isAlpha: isAlphaEligible,
          amountPaid: isAlphaEligible ? 0 : 4400, // $44 in cents
        });

        if (!order) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create order.' });
        }

        // If alpha (free), return orderId directly
        if (isAlphaEligible) {
          // Notify owner about new alpha SoulPrint order
          const { notifyOwner } = await import("./_core/notification");
          await notifyOwner({
            title: `New SoulPrint Alpha Order #${order.id}`,
            content: `Tier: ${input.tier}\nReport: ${input.reportType}\nName: ${input.name || 'Guest'}\nEmail: ${input.email || 'N/A'}\nBirth: ${input.birthDate} ${input.birthTime || ''} in ${input.birthCity}\nAlpha count: ${alphaCount + 1}/1000`,
          });
          return { orderId: order.id, checkoutUrl: null };
        }

        // Paid order — create Stripe checkout session
        try {
          const Stripe = (await import('stripe')).default;
          const stripe = new Stripe(ENV.stripeSecretKey);

          const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            customer_email: input.email || ctx.user?.email || undefined,
            client_reference_id: ctx.user?.id?.toString() || `guest_${order.id}`,
            metadata: {
              soulprint_order_id: order.id.toString(),
              user_id: ctx.user?.id?.toString() || '',
              tier: input.tier,
              report_type: input.reportType,
            },
            line_items: [{
              price_data: {
                currency: 'usd',
                product_data: {
                  name: input.reportType === 'combined'
                    ? `The Complete Human Blueprint (${input.tier === 'blueprint' ? 'Blueprint' : input.tier === 'compass' ? 'Compass' : 'Oracle'} Tier)`
                    : `SoulPrint Report (${input.tier === 'blueprint' ? 'Blueprint' : input.tier === 'compass' ? 'Compass' : 'Oracle'} Tier)`,
                  description: 'AI-synthesized personality report across 8+ frameworks',
                },
                unit_amount: 4400, // $44
              },
              quantity: 1,
            }],
            allow_promotion_codes: true,
            success_url: `${input.origin}/soulprint/report/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${input.origin}/soulprint`,
          });

          // Update order with Stripe session ID
          const { updateSoulprintOrderStripe } = await import("./db");
          await updateSoulprintOrderStripe(order.id, session.id);

          return { orderId: order.id, checkoutUrl: session.url };
        } catch (err: any) {
          console.error('[SoulPrint] Stripe checkout error:', err);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Payment setup failed. Please try again.' });
        }
      }),

    // Get a SoulPrint order by ID (for viewing the report)
    getOrder: publicProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        const { getSoulprintOrderById } = await import("./db");
        const order = await getSoulprintOrderById(input.orderId);
        if (!order) return null;
        return order;
      }),

    // Generate soulprint report (placeholder — will call TrueSelf API when available)
    generate: publicProcedure
      .input(z.object({
        assessmentId: z.number(),
        birthDate: z.string(),
        birthTime: z.string(),
        birthCity: z.string(),
      }))
      .mutation(async ({ input }) => {
        return {
          success: true,
          status: 'queued' as const,
          message: 'Your SoulPrint data has been saved. The full multi-framework report will be generated when the TrueSelf API integration goes live.',
          frameworks: [
            { name: 'Enneagram', status: 'pending' },
            { name: 'Human Design', status: 'pending' },
            { name: 'Gene Keys', status: 'pending' },
            { name: 'Western Astrology', status: 'pending' },
            { name: 'Vedic Astrology', status: 'pending' },
            { name: 'Chinese Astrology', status: 'pending' },
            { name: 'Spiral Dynamics', status: 'pending' },
            { name: 'Numerology', status: 'pending' },
          ],
        };
      }),
  }),

  // ─── Email Drip System ──────────────────────────────────────────
  emailDrip: router({
    // Enqueue a new user for the 3-email drip sequence
    enqueue: publicProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().min(1),
        assessmentId: z.number().optional(),
        domain: z.string().optional(),
        role: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const drip = await createEmailDrip({
          email: input.email.toLowerCase().trim(),
          name: input.name,
          assessmentId: input.assessmentId ?? null,
          domain: input.domain ?? null,
          role: input.role ?? null,
        });
        return { success: !!drip };
      }),

    // Unsubscribe from drip emails
    unsubscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        await unsubscribeDrip(input.email);
        return { success: true };
      }),

    // Get pending drips for a specific day (admin only)
    pending: protectedProcedure
      .input(z.object({ day: z.enum(['day1', 'day3', 'day7']) }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return getPendingDrips(input.day);
      }),

    // Mark a drip as sent (admin only)
    markSent: protectedProcedure
      .input(z.object({ id: z.number(), day: z.enum(['day1', 'day3', 'day7']) }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        await markDripSent(input.id, input.day);
        return { success: true };
      }),

    // Generate email content using LLM (admin only)
    generateEmail: protectedProcedure
      .input(z.object({
        day: z.enum(['day1', 'day3', 'day7']),
        recipientName: z.string(),
        role: z.string().optional(),
        domain: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        const { invokeLLM } = await import("./_core/llm");

        const dayPrompts: Record<string, string> = {
          day1: `Write a warm, personal Day 1 onboarding email for ${input.recipientName} who just completed their Flow Circuit assessment and was identified as a ${input.role || 'team member'}. Subject line + body. The email should recap what their role means, why it matters, and invite them to share their results. Keep it under 200 words. Brand voice: confident, direct, slightly provocative. Sign off as The Flow Circuit team.`,
          day3: `Write a Day 3 follow-up email for ${input.recipientName} (Flow Circuit role: ${input.role || 'unknown'})${input.domain ? ` at ${input.domain}` : ''}. The email should urge them to invite 3-5 colleagues to take the assessment so they can see their team map. Emphasize that individual results are only 30% of the picture — the real insight comes from seeing how your energy interacts with others. Include a clear CTA to "Find Your Tribe." Under 200 words.`,
          day7: `Write a Day 7 email for ${input.recipientName} (Flow Circuit role: ${input.role || 'unknown'}). This email should focus on the STRESS COST of operating outside your natural role. Use specific data: cortisol increases, cognitive load tax, flow state blockade. Frame it as "every day you operate outside your nature, you're leaving performance on the table." End with CTA to revisit their results or invite their team. Under 200 words. Make it feel urgent but not pushy.`,
        };

        const response = await invokeLLM({
          messages: [
            { role: 'system', content: 'You are a copywriter for The Flow Circuit, a team performance assessment platform. Write emails that are direct, confident, and backed by science. Never use generic corporate language. Every sentence should earn its place.' },
            { role: 'user', content: dayPrompts[input.day] },
          ],
        });

        const content = response.choices[0]?.message?.content;
        return { content: typeof content === 'string' ? content : '' };
      }),
  }),

  // ─── Admin Dashboard ──────────────────────────────────────────
  admin: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      return getAdminStats();
    }),

    // All assessments for the reports dashboard
    allAssessments: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      return getAllAssessments();
    }),

    // Distinct domains for filter dropdown
    domains: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      return getDistinctDomains();
    }),

    // Generate individual PDF on demand
    generateIndividualPDF: protectedProcedure
      .input(z.object({
        assessmentId: z.number(),
        name: z.string(),
        email: z.string().optional(),
        role: z.string(),
        score: z.number(),
        scores: z.record(z.string(), z.number()),
        shareToken: z.string().optional(),
        origin: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        const { generateAssessmentPDF } = await import("./pdfReport");
        const scores: Record<string, number> = {};
        for (const [k, v] of Object.entries(input.scores)) {
          scores[k] = typeof v === 'number' ? v : 0;
        }
        return generateAssessmentPDF({ ...input, scores });
      }),

    // Generate team friction PDF on demand
    generateTeamPDF: protectedProcedure
      .input(z.object({ domain: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        const domainAssessments = await getAssessmentsByDomain(input.domain);
        if (domainAssessments.length < 3) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: `Need at least 3 members. ${input.domain} has ${domainAssessments.length}.` });
        }
        const { generateTeamFrictionPDF } = await import("./teamFrictionReport");
        const members = domainAssessments.map(a => ({
          name: a.guestName || 'Anonymous',
          role: a.role,
          score: a.score ?? 0,
          scores: (a.scores as Record<string, number>) || {},
        }));
        const teamName = `${input.domain.charAt(0).toUpperCase() + input.domain.slice(1)} Team`;
        return generateTeamFrictionPDF({ teamName, domain: input.domain, members });
      }),
  }),

  // ─── Norming Data ─────────────────────────────────────────────
  norming: router({
    // Get aggregate norming data for the assessment population
    data: publicProcedure.query(async () => {
      return getNormingData();
    }),

    // Get percentile for a specific score within a role
    percentile: publicProcedure
      .input(z.object({ role: z.string(), score: z.number() }))
      .query(async ({ input }) => {
        const percentile = await getPercentileForScore(input.role, input.score);
        return { percentile };
      }),
  }),

  // ─── Team Comparison ──────────────────────────────────────────
  teamComparison: router({
    compare: protectedProcedure
      .input(z.object({ teamId1: z.number(), teamId2: z.number() }))
      .query(async ({ input }) => {
        return getTeamComparisonData(input.teamId1, input.teamId2);
      }),
  }),

  // ─── PDF Report ──────────────────────────────────────────────
  report: router({
    generateTeamFriction: publicProcedure
      .input(z.object({
        domain: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const domainAssessments = await getAssessmentsByDomain(input.domain);
        if (domainAssessments.length < 3) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `Need at least 3 members for a team report. ${input.domain} has ${domainAssessments.length}.` });
        }
        const { generateTeamFrictionPDF } = await import("./teamFrictionReport");
        const members = domainAssessments.map(a => ({
          name: a.guestName || "Anonymous",
          role: a.role,
          score: a.score ?? 0,
          scores: (a.scores as Record<string, number>) || {},
        }));
        const teamName = `${input.domain.charAt(0).toUpperCase() + input.domain.slice(1)} Team`;
        const result = await generateTeamFrictionPDF({ teamName, domain: input.domain, members });
        return { url: result.url, key: result.key, memberCount: members.length };
      }),

    generateFamilyFriction: publicProcedure
      .input(z.object({
        domain: z.string().min(1),
        familyName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const domainAssessments = await getAssessmentsByDomain(input.domain);
        if (domainAssessments.length < 2) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `Need at least 2 family members for a family report. ${input.domain} has ${domainAssessments.length}.` });
        }
        const { generateFamilyFrictionPDF } = await import("./familyFrictionReport");
        const members = domainAssessments.map(a => ({
          name: a.guestName || "Anonymous",
          role: a.role,
          score: a.score ?? 0,
          scores: (a.scores as Record<string, number>) || {},
        }));
        const familyName = input.familyName || `The ${input.domain.charAt(0).toUpperCase() + input.domain.slice(1).replace(/-/g, ' ')} Family`;
        const result = await generateFamilyFrictionPDF({ familyName, domain: input.domain, members });
        return { url: result.url, key: result.key, memberCount: members.length };
      }),

    generateHTML: publicProcedure
      .input(z.object({
        name: z.string(),
        dominantRole: z.string(),
        combinationProfile: z.string(),
        purityScore: z.number(),
        purityLabel: z.string(),
        percentages: z.array(z.object({ role: z.string(), percentage: z.number() })),
        stressZones: z.array(z.object({ targetRole: z.string(), stressLevel: z.number(), label: z.string() })),
        teamCode: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { generateReportHTML } = await import("./pdfReport");
        const html = generateReportHTML({
          ...input,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        });
        return { html };
      }),
  }),

  feedback: router({
    submit: publicProcedure
      .input(z.object({
        assessmentId: z.number().optional(),
        teamId: z.number().optional(),
        authorName: z.string().min(1).max(255),
        authorEmail: z.string().email().optional(),
        accuracyRating: z.number().min(1).max(5).optional(),
        comment: z.string().max(2000).optional(),
        teamInsightRating: z.number().min(1).max(5).optional(),
        teamComment: z.string().max(2000).optional(),
        wouldRecommend: z.boolean().optional(),
        suggestion: z.string().max(2000).optional(),
      }))
      .mutation(async ({ input }) => {
        return saveFeedback({
          assessmentId: input.assessmentId ?? null,
          teamId: input.teamId ?? null,
          authorName: input.authorName,
          authorEmail: input.authorEmail ?? null,
          accuracyRating: input.accuracyRating ?? null,
          comment: input.comment ?? null,
          teamInsightRating: input.teamInsightRating ?? null,
          teamComment: input.teamComment ?? null,
          wouldRecommend: input.wouldRecommend ?? null,
          suggestion: input.suggestion ?? null,
        });
      }),

    byTeam: protectedProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ ctx, input }) => {
        const team = await getTeamById(input.teamId);
        if (!team || team.ownerId !== ctx.user.id) return [];
        return getFeedbackByTeam(input.teamId);
      }),
  }),

  // ─── Testimonials ──────────────────────────────────────────────
  testimonial: router({
    submit: publicProcedure
      .input(z.object({
        authorName: z.string().min(1).max(255),
        authorEmail: z.string().email().optional(),
        testimonialQuote: z.string().min(10).max(2000),
        authorTitle: z.string().max(255).optional(),
        authorCompany: z.string().max(255).optional(),
        flowCircuitRole: z.string().max(64).optional(),
        assessmentId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await submitTestimonial({
          authorName: input.authorName,
          authorEmail: input.authorEmail ?? null,
          testimonialQuote: input.testimonialQuote,
          authorTitle: input.authorTitle ?? null,
          authorCompany: input.authorCompany ?? null,
          flowCircuitRole: input.flowCircuitRole ?? null,
          assessmentId: input.assessmentId ?? null,
        });
        return { success: !!result };
      }),

    approved: publicProcedure.query(async () => {
      return getApprovedTestimonials();
    }),

    pending: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      return getPendingTestimonials();
    }),

    approve: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        await approveTestimonial(input.id);
        return { success: true };
      }),
  }),

  // ─── Coaching Module ───────────────────────────────────────────
  coaching: router({
    generate: protectedProcedure
      .input(z.object({
        role: z.string(),
        combinationProfile: z.string(),
        purityScore: z.number(),
        percentages: z.array(z.object({ role: z.string(), percentage: z.number() })),
        context: z.enum(['work', 'family', 'personal']).default('work'),
      }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");

        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: `You are a Flow Circuit coaching advisor. The Flow Circuit identifies 5 innovation roles: Spark (idea generator), Amplifier (momentum builder), Filter (quality refiner), Ground (executor), Conductor (orchestrator). Each person has a combination profile showing their primary-secondary role blend and a purity score showing how concentrated they are. Generate 3 specific, actionable coaching prompts for this week based on their profile. Each prompt should be 2-3 sentences. Format as JSON array: [{"title": "...", "prompt": "...", "category": "leverage|stretch|protect"}]. "leverage" = lean into natural strengths. "stretch" = gentle growth toward secondary role. "protect" = avoid burnout from operating outside natural energy.`
            },
            {
              role: 'user',
              content: `Profile: ${input.combinationProfile} (${input.purityScore}% purity). Role breakdown: ${input.percentages.map(p => `${p.role}: ${Math.round(p.percentage)}%`).join(', ')}. Context: ${input.context}. Generate 3 coaching prompts for this week.`
            }
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'coaching_prompts',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  prompts: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        prompt: { type: 'string' },
                        category: { type: 'string', enum: ['leverage', 'stretch', 'protect'] }
                      },
                      required: ['title', 'prompt', 'category'],
                      additionalProperties: false
                    }
                  }
                },
                required: ['prompts'],
                additionalProperties: false
              }
            }
          }
        });

        const content = response.choices[0]?.message?.content;
        try {
          const parsed = JSON.parse(typeof content === 'string' ? content : '{}');
          return { prompts: parsed.prompts || [] };
        } catch {
          return { prompts: [] };
        }
      }),
  }),

  // ─── SoulPrint Consciousness Layer ─────────────────────────────────────
  soulprintLayer: router({
    save: publicProcedure
      .input(z.object({
        assessmentId: z.number(),
        soulprintData: z.any(),
        enneagramType: z.string().optional(),
        enneagramWing: z.string().optional(),
        humanDesignType: z.string().optional(),
        humanDesignProfile: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await saveSoulprintProfile({
          assessmentId: input.assessmentId,
          soulprintData: input.soulprintData,
          enneagramType: input.enneagramType ?? null,
          enneagramWing: input.enneagramWing ?? null,
          humanDesignType: input.humanDesignType ?? null,
          humanDesignProfile: input.humanDesignProfile ?? null,
          enabled: false,
          showInTeam: false,
          consentGiven: false,
          adminHidden: false,
        });
        return { id };
      }),

    getByAssessment: publicProcedure
      .input(z.object({ assessmentId: z.number() }))
      .query(async ({ input }) => {
        return getSoulprintByAssessment(input.assessmentId);
      }),

    giveConsent: publicProcedure
      .input(z.object({ id: z.number(), consent: z.boolean() }))
      .mutation(async ({ input }) => {
        return setSoulprintConsent(input.id, input.consent);
      }),

    toggleEnabled: publicProcedure
      .input(z.object({ id: z.number(), enabled: z.boolean() }))
      .mutation(async ({ input }) => {
        return toggleSoulprintEnabled(input.id, input.enabled);
      }),

    toggleTeamView: publicProcedure
      .input(z.object({ id: z.number(), showInTeam: z.boolean() }))
      .mutation(async ({ input }) => {
        return toggleSoulprintTeamView(input.id, input.showInTeam);
      }),

    adminHide: protectedProcedure
      .input(z.object({ id: z.number(), hidden: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return adminToggleSoulprint(input.id, input.hidden);
      }),

    teamProfiles: publicProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ input }) => {
        return getTeamSoulprints(input.teamId);
      }),
  }),

  // ═══════════════════════════════════════════════════════════════════════
  // 360 PEER REVIEW
  // ═══════════════════════════════════════════════════════════════════════
  threeSixty: router({
    // Generate a 360 link for a subject (requires completed assessment)
    createSession: publicProcedure
      .input(z.object({
        subjectName: z.string().min(1),
        subjectEmail: z.string().email().optional(),
        assessmentId: z.number(),
        teamSlug: z.string().optional(),
        selfScores: z.record(z.string(), z.number()).optional(),
      }))
      .mutation(async ({ input }) => {
        // Check if session already exists for this assessment
        const existing = await get360SessionByAssessmentId(input.assessmentId);
        if (existing) {
          const count = await get360ResponseCount(existing.id);
          return { session: existing, responseCount: count, alreadyExists: true };
        }

        const session = await create360Session({
          subjectName: input.subjectName,
          subjectEmail: input.subjectEmail || null,
          subjectAssessmentId: input.assessmentId,
          teamSlug: input.teamSlug || null,
          selfScores: input.selfScores || null,
        });

        if (!session) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create 360 session' });

        return { session, responseCount: 0, alreadyExists: false };
      }),

    // Get session info by token (for reviewer page)
    getSession: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const session = await get360SessionByToken(input.token);
        if (!session) throw new TRPCError({ code: 'NOT_FOUND', message: '360 session not found or expired' });

        // Check expiry
        if (new Date() > new Date(session.expiresAt)) {
          throw new TRPCError({ code: 'NOT_FOUND', message: '360 link has expired' });
        }

        const count = await get360ResponseCount(session.id);
        return { session, responseCount: count };
      }),

    // Submit a reviewer response (no auth required)
    submitResponse: publicProcedure
      .input(z.object({
        token: z.string(),
        reviewerName: z.string().optional(),
        reviewerEmail: z.string().email().optional(),
        reviewerRelationship: z.string().optional(),
        sparkRank: z.number().min(1).max(5),
        amplifierRank: z.number().min(1).max(5),
        filterRank: z.number().min(1).max(5),
        groundRank: z.number().min(1).max(5),
        conductorRank: z.number().min(1).max(5),
      }))
      .mutation(async ({ input }) => {
        // Validate ranks sum to 15 (1+2+3+4+5)
        const rankSum = input.sparkRank + input.amplifierRank + input.filterRank + input.groundRank + input.conductorRank;
        if (rankSum !== 15) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Ranks must be unique values 1-5 (sum must equal 15)' });
        }

        const session = await get360SessionByToken(input.token);
        if (!session) throw new TRPCError({ code: 'NOT_FOUND', message: '360 session not found' });

        if (new Date() > new Date(session.expiresAt)) {
          throw new TRPCError({ code: 'NOT_FOUND', message: '360 link has expired' });
        }

        const response = await submit360Response({
          sessionId: session.id,
          reviewerName: input.reviewerName || null,
          reviewerEmail: input.reviewerEmail || null,
          reviewerRelationship: input.reviewerRelationship || null,
          sparkRank: input.sparkRank,
          amplifierRank: input.amplifierRank,
          filterRank: input.filterRank,
          groundRank: input.groundRank,
          conductorRank: input.conductorRank,
        });

        if (!response) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to submit response' });

        const count = await get360ResponseCount(session.id);

        // Notify owner about new 360 response
        try {
          const { notifyOwner } = await import("./_core/notification");
          await notifyOwner({
            title: `360 Response: ${session.subjectName} (${count} total)`,
            content: [
              `New 360 peer review submitted for **${session.subjectName}**.`,
              "",
              `**Reviewer:** ${input.reviewerName || "Anonymous"}${input.reviewerRelationship ? ` (${input.reviewerRelationship})` : ""}`,
              `**Total Responses:** ${count}`,
              count >= 3 ? "**Gap report is now available!**" : `Need ${3 - count} more for gap report.`,
            ].join("\n"),
          });
        } catch (e) {
          console.error("[360] Failed to notify owner:", e);
        }

        return { success: true, responseCount: count, gapReportReady: count >= 3 };
      }),

    // Get status and gap report for a session (subject's dashboard)
    getStatus: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const session = await get360SessionByToken(input.token);
        if (!session) throw new TRPCError({ code: 'NOT_FOUND', message: '360 session not found' });

        const count = await get360ResponseCount(session.id);
        const gapReport = count >= 3 ? await calculate360GapReport(session.id) : null;

        return {
          session,
          responseCount: count,
          gapReportReady: count >= 3,
          gapReport,
        };
      }),

    // Get session by assessment ID (to check if subject already has a 360 link)
    getByAssessment: publicProcedure
      .input(z.object({ assessmentId: z.number() }))
      .query(async ({ input }) => {
        const session = await get360SessionByAssessmentId(input.assessmentId);
        if (!session) return null;
        const count = await get360ResponseCount(session.id);
        return { session, responseCount: count };
      }),
  }),

  // TRIBE TRIAL
  trial: router({
    // Start a 30-day free trial
    signup: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        source: z.enum(['results_page', '360_link', '360_gap', 'pricing', 'pdf']).optional(),
      }))
      .mutation(async ({ input }) => {
        // Check if they already have an active trial
        const existing = await getActiveTrialByEmail(input.email);
        if (existing) {
          return { trial: existing, alreadyActive: true };
        }

        // Create 30-day trial
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const trial = await createTribeTrial({
          name: input.name,
          email: input.email.toLowerCase().trim(),
          status: 'active',
          startedAt: new Date(),
          expiresAt,
          source: input.source || 'pricing',
        });

        if (!trial) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create trial' });

        // Notify owner
        try {
          const { notifyOwner } = await import("./_core/notification");
          await notifyOwner({
            title: `New Tribe Trial: ${input.name}`,
            content: [
              `**${input.name}** (${input.email}) started a 30-day Tribe trial.`,
              `Source: ${input.source || 'pricing'}`,
              `Expires: ${expiresAt.toLocaleDateString()}`,
            ].join('\n'),
          });
        } catch (e) {
          console.error('[Trial] Failed to notify owner:', e);
        }

        return { trial, alreadyActive: false };
      }),

    // Check trial status by email
    status: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        const trial = await getTrialByEmail(input.email);
        if (!trial) return { hasTrialed: false, active: false, trial: null };
        const isExpired = new Date() > trial.expiresAt;
        const active = trial.status === 'active' && !isExpired;
        return { hasTrialed: true, active, trial };
      }),
  }),
});

export type AppRouter = typeof appRouter;
