import * as functions from 'firebase-functions';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(bodyParser.json());

// Endpoint GET /tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany();
    return res.status(200).send(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
});

// Endpoint GET /tasks/:id
app.get('/tasks/:id', async (req, res) => {
  const taskId = parseInt(req.params.id, 10);

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (task) {
      return res.status(200).send(task);
    } else {
      return res.status(404).send({ error: 'Task not found' });
    }
  } catch (error) {
    console.error('Error fetching task:', error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
});

// Endpoint POST /tasks
app.post('/tasks', async (req, res) => {
  const { title, description, completed } = req.body;

  if (typeof title !== 'string' || typeof description !== 'string' || typeof completed !== 'boolean') {
    return res.status(400).send({ error: 'Invalid request payload' });
  }

  try {
    const task = await prisma.task.create({
      data: { title, description, completed },
    });
    return res.status(201).send(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
});

// Endpoint PUT /tasks/:id
app.put('/tasks/:id', async (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const { title, description, completed } = req.body;

  if (typeof title !== 'string' || typeof description !== 'string' || typeof completed !== 'boolean') {
    return res.status(400).send({ error: 'Invalid request payload' });
  }

  try {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { title, description, completed },
    });
    return res.status(200).send(task);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).send({ error: 'Task not found' });
      }
    }
    console.error('Error updating task:', error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
});

// Endpoint DELETE /tasks/:id
app.delete('/tasks/:id', async (req, res) => {
  const taskId = parseInt(req.params.id, 10);

  try {
    const task = await prisma.task.delete({
      where: { id: taskId },
    });
    return res.status(200).send(task);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).send({ error: 'Task not found' });
      }
    }
    console.error('Error deleting task:', error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
});

// Exporta a função para o Firebase
exports.api = functions.https.onRequest(app);
