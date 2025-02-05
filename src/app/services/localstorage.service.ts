import { Injectable } from "@angular/core";
import { StorageKeys } from "../enums/enum";
@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {

  constructor() { }

  setToken(token: string): void {
    localStorage.setItem(StorageKeys.TOKEN, token);
  }
  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage?.getItem('token');
    }
    return null;
  }

  removeToken(): void {
    localStorage.removeItem(StorageKeys.TOKEN);
  }
}
