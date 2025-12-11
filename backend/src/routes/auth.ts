import { Router } from 'express';
import { register, login, checkStatus } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/status', checkStatus);

export default router;
