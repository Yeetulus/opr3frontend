import { Injectable } from '@angular/core';
import {Router, UrlTree} from "@angular/router";
import {AuthService} from "../auth-service/auth.service";
import {catchError, map, Observable, of} from "rxjs";
import {CategoryService} from "../category-service/category.service";

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService {
  constructor(private authService: AuthService,
              private router: Router,
              private categoryService: CategoryService) {}

  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {

    return this.authService.isTokenValid().pipe(
      map((isValid) => {
        if (isValid) {
          console.log('Token is valid');
          this.categoryService.fetchCategories();
          return true;
        } else {
          console.log('Invalid token, rerouting to login screen');
          this.router.navigate(['/login']);
          return false;
        }
      }),
      catchError(() => {
        console.log('Error checking token validity, rerouting to login screen');
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
