const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 7000;

app.use(express.json());

app.get('/', (req, res) => {
  return res.json({
    message: 'Welcome to the dummy payment gateway',
  });
});

app.post('/payments', async (req, res) => {
  try {
    const { amount, currency = 'INR', paymentMethod = 'card', customerName = 'Anonymous', reference } = req.body ?? {};

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        message: 'amount must be a number greater than 0',
      });
    }

    if (typeof currency !== 'string' || currency.trim().length < 3) {
      return res.status(400).json({
        message: 'currency must be a valid string',
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parsedAmount,
        currency: currency.trim().toUpperCase(),
        paymentMethod: String(paymentMethod),
        customerName: String(customerName),
        reference: reference ? String(reference) : null,
        status: 'APPROVED',
      },
    });

    console.log('Logged payment transaction:', transaction.id);

    return res.status(201).json({
      message: 'Payment accepted',
      transaction,
    });
  } catch (error) {
    console.error('Failed to record transaction:', error);
    return res.status(500).json({
      message: 'Failed to record transaction',
    });
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  return res.status(500).json({
    message: 'Internal server error',
  });
});

async function start() {
  try {
    await prisma.$connect();
    app.listen(port, () => {
      console.log(`Dummy payment gateway listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});