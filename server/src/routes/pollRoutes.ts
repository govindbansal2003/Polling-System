import { Router } from 'express';
import { pollController } from '../controllers/PollController';

const router = Router();

router.get('/active', (req, res, next) => pollController.getActivePoll(req, res, next));
router.get('/history', (req, res, next) => pollController.getPollHistory(req, res, next));
router.get('/:id/my-vote', (req, res, next) => pollController.getMyVote(req, res, next));

export default router;
