import { Router } from 'express';
import { sessionController } from '../controllers/SessionController';

const router = Router();

router.post('/validate-name', (req, res, next) =>
    sessionController.validateName(req, res, next)
);

export default router;
