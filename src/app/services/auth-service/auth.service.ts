import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {catchError, map, Observable, of} from "rxjs";
import {Router} from "@angular/router";


export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  registerUser(request: RegistrationRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, request);
  }

  login(request: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/authenticate`, request);
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/refresh-token`, {});
  }

  isTokenValid(): Observable<boolean> {
    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
      return of(false);
    }

    const decodedToken = this.decodeJwt(accessToken);

    if (!decodedToken || !decodedToken.exp) {
      return of(false);
    }

    const currentTime = Math.floor(Date.now() / 1000);
    console.log("Current token remaining time: " + (decodedToken.exp - currentTime));

    if (decodedToken.exp > currentTime) {
      return of(true);
    } else {
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        return this.refreshToken().pipe(
          map((response) => {
            if (response.access_token) {
              localStorage.setItem('access_token', response.access_token);
              return true;
            } else {
              return false;
            }
          }),
          catchError(() => of(false))
        );
      } else {
        return of(false);
      }
    }
  }

  private decodeJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    } catch (error) {
      console.error('Error decoding JWT', error);
      return null;
    }
  }
}
