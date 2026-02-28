import { Request, Response, NextFunction } from 'express';
import { sessionService } from '../services/SessionService';

export class SessionController {
    async validateName(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, role } = req.body;

            if (!name || !role) {
                res.status(400).json({ error: 'Name and role are required.' });
                return;
            }

            const isTaken = await sessionService.isNameTaken(name, role);
            res.json({ isTaken, available: !isTaken });
        } catch (error) {
            next(error);
        }
    }
}

export const sessionController = new SessionController();
