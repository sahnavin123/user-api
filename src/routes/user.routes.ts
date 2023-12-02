import { Router } from 'express';
import {
  deleteUserAccount,
  getUserDetails,
  loginUser,
  logout,
  registerUser,
  updateUserDetails,
} from '../controllers/user.controller';

const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/details').get(getUserDetails);
router.route('/update').put(updateUserDetails);
router.route('/delete').delete(deleteUserAccount);
router.route('/logout').post(logout);

export default router;
