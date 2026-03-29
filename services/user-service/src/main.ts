import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { UserController } from './controllers/user.controller';
import prisma from './config/database';
import { authMiddleware } from './middleware/auth.middleware';

console.log('--- USER-SERVICE-STARTING ---');

const app = express();
const port = process.env.PORT || 3000;
const userController = new UserController();

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(authMiddleware);

// Thử kết nối Database với Retry
const connectDB = async () => {
    let retries = 10;
    while (retries > 0) {
        try {
            await prisma.$connect();
            console.log('--- USER-SERVICE: DATABASE CONNECTED ---');
            return;
        } catch (err: any) {
            retries--;
            console.log(`--- USER-SERVICE: DB CONNECTION FAILED, RETRIES LEFT: ${retries} ---`);
            console.log(`Error: ${err.message}`);
            await new Promise(res => setTimeout(res, 5000));
        }
    }
    console.error('--- USER-SERVICE: COULD NOT CONNECT TO DATABASE, EXITING ---');
    process.exit(1);
};

connectDB().then(() => {
    // Auth Routes
    app.post('/auth/register', (req: Request, res: Response) => userController.register(req, res));
    app.post('/auth/login', (req: Request, res: Response) => userController.login(req, res));
    app.get('/auth/verify', (req: Request, res: Response) => userController.verify(req, res));
    app.post('/auth/logout', (req: Request, res: Response) => res.json({ success: true }));

    // User Routes
    app.post('/users', (req: Request, res: Response) => userController.register(req, res)); // Frontend register style
    app.get('/users', (req: Request, res: Response) => userController.getAllUsers(req, res));
    app.get('/users/:id', (req: Request, res: Response) => userController.getUserById(req, res));
    app.put('/users/:id', (req: Request, res: Response) => userController.updateProfile(req, res));
    app.delete('/users/:id', (req: Request, res: Response) => userController.deleteUser(req, res));

    // Address Routes
    app.post('/users/:id/addresses', (req: Request, res: Response) => userController.addAddress(req, res));
    app.get('/users/:id/addresses', (req: Request, res: Response) => userController.getAddresses(req, res));

    app.listen(Number(port), '0.0.0.0', () => {
        console.log(`User service listening at http://0.0.0.0:${port}`);
    });
});
