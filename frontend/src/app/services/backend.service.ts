import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class BackendService{
    private apiUrl = 'http://localhost:8080/api';
    constructor(private http: HttpClient) {}

    getHello() {
        return this.http.get(`${this.apiUrl}/hello`, { responseType: 'text' });
    }
}
