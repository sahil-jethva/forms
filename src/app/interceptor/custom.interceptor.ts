import { HttpInterceptorFn } from '@angular/common/http';
import { StorageKeys } from '../enums/enum';

export const customInterceptor: HttpInterceptorFn = (req, next) => {

  const myToken = localStorage.getItem(StorageKeys.TOKEN)
  const request = req.clone({
    setHeaders: {
      authorization: `'Bearer' ${myToken}`
    }
  });
  return next(request)
};
