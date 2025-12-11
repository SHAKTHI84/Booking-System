import { Router } from 'express';
import { getDebugStatus, forceSeedSeats } from '../controllers/debugController';

const router = Router();

router.get('/status', getDebugStatus);
router.post('/seed', forceSeedSeats);

export default router;
