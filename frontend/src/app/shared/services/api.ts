import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Projects } from '../interfaces/project.interface';

@Injectable({
  providedIn: 'root'
})
export class Api {

  private baseUrl = 'http://127.0.0.1:8055';

  constructor(private http: HttpClient) {}

  // ---------------- Auth ----------------

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/login`, { email, password });
  }

  registerUser(userData: { first_name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/register`, userData);
  }

  getMe(token: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // ---------------- Projectss ----------------

  getprojects(): Observable<{ data: Projects[] }> {
    return this.http.get<{ data: Projects[] }>(`${this.baseUrl}/items/Projects`);
  }

  createProjects(ProjectsData: any, token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/items/Projects`, ProjectsData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getProjectsByName(name: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/items/Projects/${name}`);
  }

  updateProjects(name: string, ProjectsData: any, token: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/items/Projects/${name}`, ProjectsData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  deleteProjects(name: string, token: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/items/Projects/${name}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }


// ---------------- Notes ----------------

getNotesByProjects(ProjectsId: string): Observable<any> {
  return this.http.get(`${this.baseUrl}/items/notes?filter[Projects_id][_eq]=${ProjectsId}`);
}

addNote(noteData: any, token: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/items/notes`, noteData, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

updateNote(noteId: string, noteData: any, token: string): Observable<any> {
  return this.http.patch(`${this.baseUrl}/items/notes/${noteId}`, noteData, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

deleteNote(noteId: string, token: string): Observable<any> {
  return this.http.delete(`${this.baseUrl}/items/notes/${noteId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// ---------------- PhonÃ¨mes ----------------

getAllPhonemes(): Observable<any> {
  return this.http.get(`${this.baseUrl}/items/phonemes`);
}

getPhonemesByIds(ids: string[]): Observable<any> {
  const idFilter = ids.join(',');
  return this.http.get(`${this.baseUrl}/items/phonemes?filter[id][_in]=${idFilter}`);
}

// ---------------- Projects par nom ----------------

getProjectsByTitle(title: string, token: string): Observable<any> {
  return this.http.get(`${this.baseUrl}/items/Projects?filter[title][_eq]=${title}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

updateProjectsById(ProjectsId: string, ProjectsData: any, token: string): Observable<any> {
  return this.http.patch(`${this.baseUrl}/items/Projects/${ProjectsId}`, ProjectsData, {
    headers: { Authorization: `Bearer ${token}` }
  });
}



}