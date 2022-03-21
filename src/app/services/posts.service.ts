import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BreadcrumbEntity } from '../components/breadcrumb/breadcrumb.interface';
import { ApiService } from '../core/api.service';
import { ApiUrl } from '../config/api-url';
import { PostType } from '../config/common.enum';
import { Post, PostArchiveDate, PostList, PostQueryParam } from '../interfaces/post.interface';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  constructor(
    private apiService: ApiService
  ) {
  }

  getPosts(param: PostQueryParam): Observable<{ postList: PostList, crumbs: BreadcrumbEntity[] }> {
    return this.apiService.httpGet(this.apiService.getApiUrl(ApiUrl.GET_POSTS), param).pipe(
      map((res) => res?.data || {})
    );
  }

  getPostById(postId: string, referer?: string): Observable<Post> {
    return this.apiService.httpGet(this.apiService.getApiUrlWithParam(ApiUrl.GET_POST, postId), {
      from: referer
    }).pipe(
      map((res) => res?.data || {})
    );
  }

  getPostArchiveDates({ showCount = false, limit = 10 }): Observable<PostArchiveDate[]> {
    return this.apiService.httpGet(this.apiService.getApiUrl(ApiUrl.GET_POST_ARCHIVE_DATES), {
      postType: PostType.POST,
      showCount: showCount ? 1 : 0,
      limit
    }).pipe(
      map((res) => res?.data || [])
    );
  }
}
