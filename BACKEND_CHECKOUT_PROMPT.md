# 🛒 Backend: Lägg till Stripe Checkout Endpoint

Kopiera denna prompt till ditt **Long-Term-Memory-API** backend-repo:

---

## Uppgift
Lägg till ett nytt endpoint i `src/routes/stripeRoutes.ts` för att skapa Stripe Checkout-sessioner när användare vill uppgradera till Pro-plan.

## Kod att lägga till

Lägg till denna route i `src/routes/stripeRoutes.ts` **före** `export default router;`:

```typescript
// POST /api/stripe/create-checkout-session
router.post('/create-checkout-session', hybridAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userContext?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { priceId } = req.body;
    if (!priceId) return res.status(400).json({ error: 'Price ID is required' });

    // Hämta user email från databasen
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    // Skapa Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: user?.email || undefined,
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${process.env.CORS_ORIGIN}/dashboard/billing?success=true`,
      cancel_url: `${process.env.CORS_ORIGIN}/dashboard/billing?canceled=true`,
      metadata: {
        userId, // VIKTIGT: Används i webhook för att identifiera användaren
      },
    });

    return res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});
```

## Verifiera
Kontrollera att din befintliga webhook (`src/routes/webhookRoutes.ts`) hanterar `checkout.session.completed`:

```typescript
case 'checkout.session.completed': {
  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.metadata?.userId; // 👈 Detta kommer från checkout-sessionen

  if (userId) {
    await prisma.userBilling.update({
      where: { userId },
      data: {
        tier: 'PRO',
        stripeCustomerId: session.customer as string,
      },
    });
  }
  break;
}
```

✅ Detta finns redan i din kod (rad 52-67 i webhookRoutes.ts), så inget mer behövs där!

## Tesning
1. Skapa en Price ID i Stripe Dashboard för din Pro-plan
2. Testa checkout-flödet från frontend
3. Verifiera att webhook får `checkout.session.completed` och uppgraderar användaren

---

**Det är allt! 🎉** Frontend är redan förberedd och kallar detta endpoint när användaren klickar "Upgrade to Pro".
