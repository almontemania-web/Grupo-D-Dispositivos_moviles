import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Wait for Firebase to resolve the persisted auth state before checking.
  // Without this, take(1) would capture the initial null emission on Android.
  await auth.authStateReady();

  if (auth.currentUser) return true;
  router.navigate(['/login'], { replaceUrl: true });
  return false;
};